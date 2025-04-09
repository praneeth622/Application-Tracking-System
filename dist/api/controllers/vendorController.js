"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendor = exports.updateVendor = exports.createVendor = exports.getVendorById = exports.getAllVendors = void 0;
const Vendor_1 = __importDefault(require("../models/Vendor"));
// Get all vendors
const getAllVendors = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Get query parameters
        const status = req.query.status;
        // Build query object
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        // Find all vendors
        const vendors = await Vendor_1.default.find(query).sort({ created_at: -1 });
        res.status(200).json(vendors);
    }
    catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};
exports.getAllVendors = getAllVendors;
// Get vendor by ID
const getVendorById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const vendor = await Vendor_1.default.findById(id);
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.status(200).json(vendor);
    }
    catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ error: 'Failed to fetch vendor' });
    }
};
exports.getVendorById = getVendorById;
// Create a new vendor
const createVendor = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Add metadata to vendor data
        const vendorData = {
            ...req.body,
            metadata: {
                created_by: userEmail,
                created_by_id: userId,
                last_modified_by: userEmail,
            }
        };
        const vendor = new Vendor_1.default(vendorData);
        await vendor.save();
        res.status(201).json(vendor);
    }
    catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ error: 'Failed to create vendor' });
    }
};
exports.createVendor = createVendor;
// Update an existing vendor
const updateVendor = async (req, res) => {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const vendor = await Vendor_1.default.findById(id);
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        // Update vendor data with last modifier info
        const updatedVendorData = {
            ...req.body,
            'metadata.last_modified_by': userEmail,
        };
        const updatedVendor = await Vendor_1.default.findByIdAndUpdate(id, updatedVendorData, { new: true });
        res.status(200).json(updatedVendor);
    }
    catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: 'Failed to update vendor' });
    }
};
exports.updateVendor = updateVendor;
// Delete a vendor
const deleteVendor = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const vendor = await Vendor_1.default.findById(id);
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        // Delete vendor
        await Vendor_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Vendor deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
};
exports.deleteVendor = deleteVendor;
