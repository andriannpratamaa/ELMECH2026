const pool = require('../config/database');

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: items[0]
    });
  } catch (err) {
    next(err);
  }
};

const getAllItems = async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT * FROM items ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (err) {
    next(err);
  }
};

const getItemsByLab = async (req, res, next) => {
  try {
    const { laboratoryId } = req.params;

    const [labs] = await pool.query(
      'SELECT item_ids FROM laboratories WHERE id = ?',
      [laboratoryId]
    );
    if (labs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Laboratorium tidak ditemukan'
      });
    }

    const itemIds = labs[0].item_ids ? labs[0].item_ids.split(',').map(Number) : [];
    if (itemIds.length === 0) {
      return res.status(200).json({ success: true, data: [], total: 0 });
    }

    const [items] = await pool.query(
      `SELECT * FROM items WHERE id IN (?) ORDER BY created_at DESC`,
      [itemIds]
    );

    res.status(200).json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (err) {
    next(err);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    if (!req.user.laboratory_id) {
      return res.status(200).json({ success: true, data: [], total: 0 });
    }

    const [labs] = await pool.query(
      'SELECT item_ids FROM laboratories WHERE id = ?',
      [req.user.laboratory_id]
    );
    if (labs.length === 0) {
      return res.status(200).json({ success: true, data: [], total: 0 });
    }

    const itemIds = labs[0].item_ids ? labs[0].item_ids.split(',').map(Number) : [];
    if (itemIds.length === 0) {
      return res.status(200).json({ success: true, data: [], total: 0 });
    }

    const [items] = await pool.query(
      `SELECT * FROM items WHERE id IN (?) ORDER BY created_at DESC`,
      [itemIds]
    );

    res.status(200).json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { nama_barang, kode_barang, pembuat_alat, tanggal_pembelian, kondisi, status } = req.body;

    if (!kode_barang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang harus diisi'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO items (nama_barang, kode_barang, pembuat_alat, tanggal_pembelian, kondisi, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_barang, kode_barang, pembuat_alat || null, tanggal_pembelian || null, kondisi, status || 'aktif']
    );

    res.status(201).json({
      success: true,
      message: 'Barang berhasil dibuat',
      data: {
        id: result.insertId,
        nama_barang,
        kode_barang,
        pembuat_alat: pembuat_alat || null,
        tanggal_pembelian: tanggal_pembelian || null,
        kondisi,
        status: status || 'aktif'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update item (admin only)
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_barang, kode_barang, pembuat_alat, tanggal_pembelian, kondisi, status } = req.body;

    // Check if item exists
    const [items] = await pool.query('SELECT id FROM items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Update item
    await pool.query(
      'UPDATE items SET nama_barang = ?, kode_barang = ?, pembuat_alat = ?, tanggal_pembelian = ?, kondisi = ?, status = ? WHERE id = ?',
      [nama_barang, kode_barang, pembuat_alat || null, tanggal_pembelian || null, kondisi, status, id]
    );

    res.status(200).json({
      success: true,
      message: 'Barang berhasil diperbarui'
    });
  } catch (err) {
    next(err);
  }
};

// Delete item (admin only)
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const [items] = await pool.query('SELECT id FROM items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Delete item
    await pool.query('DELETE FROM items WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Barang berhasil dihapus'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems,
  getItemsByLab,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
