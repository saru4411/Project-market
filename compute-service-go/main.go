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

type SizingResponse struct {
	ParentCode    string           `json:"parentCode"`
	Suborders     []SuborderResult `json:"suborders"`
	GrandSubtotal float64          `json:"grandSubtotal"`
	GrandTax      float64          `json:"grandTax"`
	GrandFreight  float64          `json:"grandFreight"`
	GrandTotal    float64          `json:"grandTotal"`
	Message       string           `json:"message"`
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

func handleCalculate(w http.ResponseWriter, r *http.Request) {
	// Enable CORS & JSON headers
	w.Header().Set("Content-Type", "application/json")
	
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://node-gateway:3000",
		"https://inditrade.com",
	}

	origin := r.Header.Get("Origin")
	for _, allowed := range allowedOrigins {
		if origin == allowed {
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
		for j, t := range item.Tiers {
			if t.Min < 0 {
				http.Error(w, fmt.Sprintf(`{"error":"Item %d, Tier %d: Min cannot be negative"}`, i+1, j+1), http.StatusBadRequest)
				return
			}
			if t.Max != nil && *t.Max < t.Min {
				http.Error(w, fmt.Sprintf(`{"error":"Item %d, Tier %d: Max cannot be less than Min"}`, i+1, j+1), http.StatusBadRequest)
				return
			}
			if t.Price < 0 {
				http.Error(w, fmt.Sprintf(`{"error":"Item %d, Tier %d: Price cannot be negative"}`, i+1, j+1), http.StatusBadRequest)
				return
			}
		}
	}

	// Generate a cryptographically random, collision-resistant order code
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		http.Error(w, `{"error":"Failed to generate order code"}`, http.StatusInternalServerError)
		return
	}
	parentCode := fmt.Sprintf("ORD-%s", strings.ToUpper(hex.EncodeToString(b)))
	var suborders []SuborderResult
	var grandSubtotal, grandTax, grandFreight, grandTotal float64

	for i, item := range req.Items {
		// 1. Calculate Unit Price ex-factory based on tiers
		unitPrice := 0.0
		if len(item.Tiers) > 0 {
			unitPrice = item.Tiers[0].Price // Fallback
			for _, t := range item.Tiers {
				if item.Quantity >= t.Min && (t.Max == nil || item.Quantity <= *t.Max) {
					unitPrice = t.Price
				}
			}
		}

		subtotal := float64(item.Quantity) * unitPrice
		tax := subtotal * 0.18 // Flat 18% total GST rate

		// 2. Classify Intrastate vs Interstate taxation types
		taxType := "IGST (18%)"
		if strings.EqualFold(strings.TrimSpace(item.SupplierState), strings.TrimSpace(req.BuyerState)) {
			taxType = "CGST (9%) + SGST (9%)"
		}

		// 3. Weight-Based Carriage Freight Sizing
		totalWeight := item.WeightPerUnit * float64(item.Quantity)
		rate := 6.0 // V-Trans road carrier default
		switch strings.ToLower(req.Carrier) {
		case "delhivery":
			rate = 18.0
		case "tci":
			rate = 4.0
		}
		freight := math.Ceil(totalWeight * rate)
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

	response := SizingResponse{
		ParentCode:    parentCode,
		Suborders:     suborders,
		GrandSubtotal: grandSubtotal,
		GrandTax:      grandTax,
		GrandFreight:  grandFreight,
		GrandTotal:    grandTotal,
		Message:       fmt.Sprintf("SafeTrade contract split into %d sub-orders and dynamic ex-factory invoicing calculations sync committed successfully via %s.", len(suborders), req.PaymentMethod),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
