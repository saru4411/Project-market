package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
)

// Request Structures
type PriceTier struct {
	Min   int     `json:"min"`
	Max   *int    `json:"max"` // can be nil
	Price float64 `json:"price"`
}

type OrderItem struct {
	ProductId     string      `json:"productId"`
	ProductName   string      `json:"productName"`
	Quantity      int         `json:"quantity"`
	WeightPerUnit float64     `json:"weightPerUnit"`
	Tiers         []PriceTier `json:"tiers"`
	SupplierState string      `json:"supplierState"`
	SupplierId    int         `json:"supplierId"`
}

type SizingRequest struct {
	Items         []OrderItem `json:"items"`
	BuyerState    string      `json:"buyerState"`
	Carrier       string      `json:"carrier"`
	PaymentMethod string      `json:"paymentMethod"`
}

// Response Structures
type SuborderResult struct {
	OrderCode     string  `json:"orderCode"`
	ProductName   string  `json:"productName"`
	Quantity      int     `json:"quantity"`
	Subtotal      float64 `json:"subtotal"`
	Tax           float64 `json:"tax"`
	Freight       float64 `json:"freight"`
	Total         float64 `json:"total"`
	SupplierId    int     `json:"supplierId"`
	SupplierState string  `json:"supplierState"`
	TaxType       string  `json:"taxType"` // CGST/SGST vs IGST
}

func main() {

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	http.HandleFunc("/calculate", handleCalculate)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}
	fmt.Printf("====================================================\n")
	fmt.Printf("  INDITRADE GO CALCULATIONS SERVICE RUNNING ON %s\n", port)
	fmt.Printf("  Protocol: JSON REST over HTTP/2\n")
	fmt.Printf("====================================================\n")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Fatal: Go server failed to start: %v", err)
	}
}

// Coordinate represents geographical latitude and longitude
type Coordinate struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

// Supplier industrial hub coordinates database
var hubCoordinates = map[string]Coordinate{
	"surat":     {21.1702, 72.8311}, // Gujarat
	"morbi":     {22.8120, 70.8236}, // Gujarat
	"tirupur":   {11.1085, 77.3411}, // Tamil Nadu
	"aligarh":   {27.8837, 78.0800}, // Uttar Pradesh
	"assam":     {26.1158, 91.7086}, // Assam (Guwahati Tea Cluster)
	"moradabad": {28.8386, 78.7733}, // Uttar Pradesh (Brassware Hub)
}

// Buyer state logistics terminal capital coordinates
var stateCoordinates = map[string]Coordinate{
	"gujarat":       {23.0225, 72.5714},  // Ahmedabad
	"maharashtra":   {19.0760, 72.8777},  // Mumbai
	"tamil nadu":    {13.0827, 80.2707},  // Chennai
	"uttar pradesh": {26.4499, 80.3319},  // Kanpur
	"delhi":         {28.6139, 77.2090},  // Delhi
	"karnataka":     {12.9716, 77.5946},  // Bengaluru
	"assam":         {26.1158, 91.7086},  // Guwahati
}

// ShippingOption defines a structured cargo shipping choice returned to storefront
type ShippingOption struct {
	Carrier              string  `json:"carrier"`
	Name                 string  `json:"name"`
	Cost                 float64 `json:"cost"`
	TransitDays          int     `json:"transitDays"`
	Type                 string  `json:"type"`
	IsRecommended        bool    `json:"isRecommended"`
	IsCheapest           bool    `json:"isCheapest"`
	RecommendationReason string  `json:"recommendationReason"`
}

// Enhanced SizingResponse supporting logistics telemetry
type SizingResponse struct {
	ParentCode       string           `json:"parentCode"`
	Suborders        []SuborderResult `json:"suborders"`
	GrandSubtotal    float64          `json:"grandSubtotal"`
	GrandTax         float64          `json:"grandTax"`
	GrandFreight     float64          `json:"grandFreight"`
	GrandTotal       float64          `json:"grandTotal"`
	Message          string           `json:"message"`
	ShippingOptions  []ShippingOption `json:"shippingOptions"`
	DistanceKm       float64          `json:"distanceKm"`
	ChargeableWeight float64          `json:"chargeableWeight"`
	DeadWeight       float64          `json:"deadWeight"`
	VolumetricWeight float64          `json:"volumetricWeight"`
}

// Helper: Calculate great-circle distance using Haversine formula
func calculateDistance(c1, c2 Coordinate) float64 {
	const R = 6371.0 // Earth radius in km
	dLat := (c2.Lat - c1.Lat) * math.Pi / 180.0
	dLon := (c2.Lon - c1.Lon) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(c1.Lat*math.Pi/180.0)*math.Cos(c2.Lat*math.Pi/180.0)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	dist := R * c
	if dist < 40.0 {
		return 40.0 // Minimum LTL flat billing distance
	}
	return dist
}

// Helper: Resolve geographical hub/state coordinates
func resolveSupplierCoordinate(stateName string) Coordinate {
	sClean := strings.ToLower(strings.TrimSpace(stateName))
	
	// Check if state is direct match
	if coord, ok := stateCoordinates[sClean]; ok {
		return coord
	}
	
	// Attempt fuzzy match for hubs or states
	for k, v := range hubCoordinates {
		if strings.Contains(sClean, k) {
			return v
		}
	}
	for k, v := range stateCoordinates {
		if strings.Contains(sClean, k) {
			return v
		}
	}
	
	// Default Surat (Gujarat hub center)
	return Coordinate{21.1702, 72.8311}
}

func resolveBuyerCoordinate(stateName string) Coordinate {
	sClean := strings.ToLower(strings.TrimSpace(stateName))
	if coord, ok := stateCoordinates[sClean]; ok {
		return coord
	}
	for k, v := range stateCoordinates {
		if strings.Contains(sClean, k) {
			return v
		}
	}
	// Default Mumbai (Maharashtra gateway)
	return Coordinate{19.0760, 72.8777}
}

// Helper: Get volumetric package density per product category (m3 / kg)
func getVolumetricDensity(productName string) float64 {
	pClean := strings.ToLower(productName)
	
	if strings.Contains(pClean, "fabric") || strings.Contains(pClean, "apparel") || strings.Contains(pClean, "yarn") || strings.Contains(pClean, "shirt") {
		return 0.003 // Bulky textiles (high volume, lightweight)
	}
	if strings.Contains(pClean, "ceramic") || strings.Contains(pClean, "tile") || strings.Contains(pClean, "stone") {
		return 0.0005 // Heavy ceramics (dense, low volume)
	}
	if strings.Contains(pClean, "lock") || strings.Contains(pClean, "metal") || strings.Contains(pClean, "hardware") {
		return 0.0004 // Industrial hardware (highly compact)
	}
	if strings.Contains(pClean, "tea") || strings.Contains(pClean, "leaves") {
		return 0.002 // Decent volume
	}
	if strings.Contains(pClean, "handicraft") || strings.Contains(pClean, "decor") || strings.Contains(pClean, "vase") {
		return 0.004 // Bulky handicrafts
	}
	
	return 0.0015 // Default standard package density
}

// Helper: Calculate cost and transit times for a single carrier
func computeCarrierFreight(carrier string, distanceKm, chargeableWeight float64) (float64, int, string) {
	var cost float64
	var transitDays int
	var mode string

	switch strings.ToLower(carrier) {
	case "vtrans":
		// V-Trans Road Sandbox
		// Base Fee: 300, Rate: ₹0.006 per kg per km, min billing weight 50 kg
		baseFee := 300.0
		billWeight := math.Max(chargeableWeight, 50.0)
		cost = baseFee + (billWeight * distanceKm * 0.006)
		transitDays = int(math.Ceil(distanceKm / 400.0)) // 400 km / day transit speed
		mode = "Road LTL"
		
	case "tci":
		// TCI Bulk Cargo
		// Base Fee: 600, Rate: ₹0.0035 per kg per km, min billing weight 200 kg
		baseFee := 600.0
		billWeight := math.Max(chargeableWeight, 200.0)
		cost = baseFee + (billWeight * distanceKm * 0.0035)
		transitDays = int(math.Ceil(distanceKm/300.0)) + 1 // 300 km / day speed + 1 day terminal sorting
		mode = "Bulk Cargo Economy"
		
	case "delhivery":
		// Delhivery Express
		// Base Fee: 180, Rate: ₹0.016 per kg per km, min billing weight 10 kg
		baseFee := 180.0
		billWeight := math.Max(chargeableWeight, 10.0)
		cost = baseFee + (billWeight * distanceKm * 0.016)
		transitDays = int(math.Ceil(distanceKm / 800.0)) // 800 km / day air/express speed
		mode = "Express Air Cargo"
		
	default:
		// Fallback V-Trans
		baseFee := 300.0
		billWeight := math.Max(chargeableWeight, 50.0)
		cost = baseFee + (billWeight * distanceKm * 0.006)
		transitDays = int(math.Ceil(distanceKm / 400.0))
		mode = "Road LTL"
	}

	if transitDays < 1 {
		transitDays = 1
	}

	return math.Ceil(cost), transitDays, mode
}

func handleCalculate(w http.ResponseWriter, r *http.Request) {
	// Enable CORS & JSON headers
	w.Header().Set("Content-Type", "application/json")
	
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:80",
		"http://localhost",
		"http://127.0.0.1:3000",
	}

	origin := r.Header.Get("Origin")
	for _, allowed := range allowedOrigins {
		if origin == allowed || strings.HasPrefix(origin, "http://localhost") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			break
		}
	}

	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req SizingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Malformed request payload: %v"}`, err), http.StatusBadRequest)
		return
	}

	if len(req.Items) == 0 {
		http.Error(w, `{"error":"No sourcing items specified for invoice calculations"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.BuyerState) == "" {
		http.Error(w, `{"error":"BuyerState is required and cannot be empty"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Carrier) == "" {
		http.Error(w, `{"error":"Carrier is required and cannot be empty"}`, http.StatusBadRequest)
		return
	}

	// Validate inputs
	for i, item := range req.Items {
		if strings.TrimSpace(item.ProductId) == "" {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: ProductId is required"}`, i+1), http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(item.ProductName) == "" {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: ProductName is required"}`, i+1), http.StatusBadRequest)
			return
		}
		if item.Quantity <= 0 {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: Quantity must be a positive integer"}`, i+1), http.StatusBadRequest)
			return
		}
		if item.WeightPerUnit < 0 {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: WeightPerUnit cannot be negative"}`, i+1), http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(item.SupplierState) == "" {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: SupplierState is required"}`, i+1), http.StatusBadRequest)
			return
		}
		if item.SupplierId <= 0 {
			http.Error(w, fmt.Sprintf(`{"error":"Item %d: SupplierId must be positive"}`, i+1), http.StatusBadRequest)
			return
		}
	}

	// Generate order codes
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		http.Error(w, `{"error":"Failed to generate order code"}`, http.StatusInternalServerError)
		return
	}
	parentCode := fmt.Sprintf("ORD-%s", strings.ToUpper(hex.EncodeToString(b)))
	var suborders []SuborderResult
	var grandSubtotal, grandTax, grandFreight, grandTotal float64

	// Metrics aggregates for all items
	var totalDistanceKm float64
	var totalDeadWeight float64
	var totalVolumetricWeight float64
	var totalChargeableWeight float64

	buyerCoord := resolveBuyerCoordinate(req.BuyerState)

	for i, item := range req.Items {
		// 1. Volume tier unit-price matching
		unitPrice := 0.0
		if len(item.Tiers) > 0 {
			unitPrice = item.Tiers[0].Price
			for _, t := range item.Tiers {
				if item.Quantity >= t.Min && (t.Max == nil || item.Quantity <= *t.Max) {
					unitPrice = t.Price
				}
			}
		}

		subtotal := float64(item.Quantity) * unitPrice
		tax := subtotal * 0.18 // Flat 18% total GST rate

		taxType := "IGST (18%)"
		if strings.EqualFold(strings.TrimSpace(item.SupplierState), strings.TrimSpace(req.BuyerState)) {
			taxType = "CGST (9%) + SGST (9%)"
		}

		// 2. Haversine Distance Sizing
		supplierCoord := resolveSupplierCoordinate(item.SupplierState)
		distance := calculateDistance(supplierCoord, buyerCoord)
		totalDistanceKm += distance

		// 3. Volumetric Weight Calculation
		deadWeight := item.WeightPerUnit * float64(item.Quantity)
		density := getVolumetricDensity(item.ProductName)
		volumeM3 := density * deadWeight
		volumetricWeight := volumeM3 * 200.0 // Simplified (Volume in cm3) / 5000 factor
		chargeableWeight := math.Max(deadWeight, volumetricWeight)

		totalDeadWeight += deadWeight
		totalVolumetricWeight += volumetricWeight
		totalChargeableWeight += chargeableWeight

		// 4. Calculate Freight for selected carrier
		freight, _, _ := computeCarrierFreight(req.Carrier, distance, chargeableWeight)
		total := subtotal + tax + freight

		orderCode := parentCode
		if len(req.Items) > 1 {
			orderCode = fmt.Sprintf("%s-%d", parentCode, i+1)
		}

		suborders = append(suborders, SuborderResult{
			OrderCode:     orderCode,
			ProductName:   item.ProductName,
			Quantity:      item.Quantity,
			Subtotal:      subtotal,
			Tax:           tax,
			Freight:       freight,
			Total:         total,
			SupplierId:    item.SupplierId,
			SupplierState: item.SupplierState,
			TaxType:       taxType,
		})

		grandSubtotal += subtotal
		grandTax += tax
		grandFreight += freight
		grandTotal += total
	}

	// Average distance if multi-supplier splits
	avgDistance := totalDistanceKm / float64(len(req.Items))

	// 5. Multi-Carrier Optimization Algorithmic Grid
	carriers := []string{"vtrans", "tci", "delhivery"}
	shippingOptions := make([]ShippingOption, len(carriers))
	
	cheapestIdx := 0
	minCarrierCost := math.MaxFloat64

	for idx, c := range carriers {
		var carrierTotalFreight float64
		var maxTransitDays int
		var carrierMode string

		for _, item := range req.Items {
			supplierCoord := resolveSupplierCoordinate(item.SupplierState)
			dist := calculateDistance(supplierCoord, buyerCoord)
			
			deadWt := item.WeightPerUnit * float64(item.Quantity)
			dens := getVolumetricDensity(item.ProductName)
			volWt := (dens * deadWt) * 200.0
			chargeableWt := math.Max(deadWt, volWt)

			itemFreight, transit, mode := computeCarrierFreight(c, dist, chargeableWt)
			carrierTotalFreight += itemFreight
			if transit > maxTransitDays {
				maxTransitDays = transit
			}
			carrierMode = mode
		}

		var displayName string
		switch c {
		case "vtrans":
			displayName = "V-Trans (Road LTL)"
		case "tci":
			displayName = "TCI Freight (Bulk Economy)"
		case "delhivery":
			displayName = "Delhivery Cargo (Express)"
		}

		shippingOptions[idx] = ShippingOption{
			Carrier:     c,
			Name:        displayName,
			Cost:        carrierTotalFreight,
			TransitDays: maxTransitDays,
			Type:        carrierMode,
		}

		if carrierTotalFreight < minCarrierCost {
			minCarrierCost = carrierTotalFreight
			cheapestIdx = idx
		}
	}

	shippingOptions[cheapestIdx].IsCheapest = true

	// Recommendation Strategy
	// - Delhivery: for lightweight time-sensitive loads (< 40 kg)
	// - TCI Freight: heavy bulk (> 400 kg) LTL/FTL
	// - V-Trans: balanced standard mid-tier freight
	recommendedIdx := 0
	if totalChargeableWeight < 40.0 {
		recommendedIdx = 2 // Delhivery Express
		shippingOptions[recommendedIdx].RecommendationReason = "Ideal for compact parcel cargo (< 40 Kg)"
	} else if totalChargeableWeight >= 400.0 {
		recommendedIdx = 1 // TCI
		shippingOptions[recommendedIdx].RecommendationReason = "Lowest freight cost for heavy bulk shipments (>= 400 Kg)"
	} else {
		recommendedIdx = 0 // V-Trans
		shippingOptions[recommendedIdx].RecommendationReason = "Best balanced value for mid-weight cargo transport"
	}

	shippingOptions[recommendedIdx].IsRecommended = true

	if cheapestIdx == recommendedIdx {
		shippingOptions[cheapestIdx].RecommendationReason += " (Most Economical)"
	} else {
		shippingOptions[cheapestIdx].RecommendationReason = "Lowest total cost route"
	}

	response := SizingResponse{
		ParentCode:       parentCode,
		Suborders:        suborders,
		GrandSubtotal:    grandSubtotal,
		GrandTax:         grandTax,
		GrandFreight:     grandFreight,
		GrandTotal:       grandTotal,
		Message:          fmt.Sprintf("SafeTrade dispatch sized successfully at %.1f Km. Chargeable weight: %.1f Kg (Deadweight: %.1f Kg, Volumetric: %.1f Kg).", avgDistance, totalChargeableWeight, totalDeadWeight, totalVolumetricWeight),
		ShippingOptions:  shippingOptions,
		DistanceKm:       math.Round(avgDistance*10) / 10,
		ChargeableWeight: math.Round(totalChargeableWeight*10) / 10,
		DeadWeight:       math.Round(totalDeadWeight*10) / 10,
		VolumetricWeight: math.Round(totalVolumetricWeight*10) / 10,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

