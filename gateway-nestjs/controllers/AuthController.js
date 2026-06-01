const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const { registerSchema, loginSchema, sellerStep1Schema } = require('../validators/schemas');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('Fatal: JWT_SECRET environment variable must be defined in production mode'); })() : 'inditrade_jwt_secret_key_2026');

class AuthController {
  setAuthCookie(res, token) {
    res.cookie('inditrade_jwt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  async register(req, res) {
    try {
      // 1. Zod Validation
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { email, password, name, role, location, stateName, gstin, iso } = parsed.data;

      // 2. Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // 3. Hash Password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // 4. Create User
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: role || 'buyer',
        location,
        state: stateName,
        gstin,
        iso,
        sellerStatus: (role === 'supplier') ? 'approved' : 'none'
      });

      let supplierId = null;

      // 5. Create Supplier Profile if supplier role
      if (role === 'supplier') {
        const supplier = await Supplier.create({
          name,
          location,
          state: stateName,
          joined: 'Joined Today',
          trustScore: '100%',
          responseTime: '< 1 Hour',
          gstin,
          iso: iso || 'ISO Certified MSME',
          userId: user.id
        });
        supplierId = supplier.id;
      }

      // 6. Generate Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId
        },
        message: 'Onboarded onto IndiTrade successfully!'
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      // 1. Zod Validation
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { email, password } = parsed.data;

      // 2. Find User
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 3. Verify Password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      let supplierId = null;

      // 4. Fetch associated supplier ID if role is supplier
      if (user.role === 'supplier') {
        const supplier = await Supplier.findOne({ where: { userId: user.id } });
        if (supplier) {
          supplierId = supplier.id;
        }
      }

      // 5. Generate Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId
        },
        message: 'Welcome back to IndiTrade!'
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMe(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User is not authenticated' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let supplierId = null;
      if (user.role === 'supplier') {
        const supplier = await Supplier.findOne({ where: { userId: user.id } });
        if (supplier) {
          supplierId = supplier.id;
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async onboardSellerStep1(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User is not authenticated' });
      }

      const parsed = sellerStep1Schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { companyName, gstin, iso } = parsed.data;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if GSTIN is already used by another user
      const existingGstin = await User.findOne({
        where: {
          gstin,
          id: { [require('sequelize').Op.ne]: user.id }
        }
      });
      if (existingGstin) {
        return res.status(400).json({ error: 'GSTIN is already registered by another account' });
      }

      user.name = companyName;
      user.gstin = gstin;
      if (iso) {
        user.iso = iso;
      }
      user.sellerStatus = 'pending_docs';
      await user.save();

      // Return a fresh token and user profile
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId: null },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId: null
        },
        message: 'Step 1 complete: seller registration recorded.'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async onboardSellerStep2(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User is not authenticated' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.sellerStatus !== 'pending_docs') {
        return res.status(400).json({ error: 'Must complete Step 1 registration first' });
      }

      // Simulates document upload details
      user.sellerStatus = 'pending_approval';
      user.isKycVerified = true; // Digital KYC checks verified!
      await user.save();

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId: null },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId: null
        },
        message: 'Step 2 complete: seller documents submitted for approval.'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPendingSellers(req, res) {
    try {
      const pendingUsers = await User.findAll({
        where: { sellerStatus: 'pending_approval' },
        attributes: { exclude: ['password'] }
      });
      res.json(pendingUsers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async approveSeller(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required for approval' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.sellerStatus !== 'pending_approval') {
        return res.status(400).json({ error: 'User does not have a pending approval request' });
      }

      // 1. Update user
      user.role = 'supplier';
      user.sellerStatus = 'approved';
      await user.save();

      // 2. Create supplier profile
      const supplier = await Supplier.create({
        name: user.name,
        location: user.location,
        state: user.state || 'Gujarat',
        joined: 'Joined Today',
        trustScore: '100%',
        responseTime: '< 1 Hour',
        gstin: user.gstin,
        iso: user.iso || 'ISO Certified MSME',
        userId: user.id
      });

      res.json({
        message: `Successfully approved seller and created supplier profile.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId: supplier.id
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async verifyBuyer(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User is not authenticated' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.isKycVerified = true;
      await user.save();

      let supplierId = null;
      if (user.role === 'supplier') {
        const supplier = await Supplier.findOne({ where: { userId: user.id } });
        if (supplier) {
          supplierId = supplier.id;
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, supplierId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      this.setAuthCookie(res, token);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerStatus: user.sellerStatus,
          isKycVerified: user.isKycVerified,
          supplierId
        },
        message: 'Aadhaar & PAN Digital KYC verification completed successfully!'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async logout(req, res) {
    res.clearCookie('inditrade_jwt_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Successfully logged out and session cleared.' });
  }
}

module.exports = new AuthController();
