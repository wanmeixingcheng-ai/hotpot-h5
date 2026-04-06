const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 数据库初始化
let db;
const DB_PATH = path.join(__dirname, 'database.db');

async function initDB() {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    // 创建表
    db.run(`
        CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image TEXT NOT NULL,
            link TEXT,
            sort_order INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_zh TEXT,
            name_ja TEXT,
            name_en TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_zh TEXT,
            name_ja TEXT,
            name_en TEXT,
            price REAL NOT NULL,
            original_price REAL,
            category_id INTEGER,
            image TEXT,
            stock INTEGER DEFAULT 100,
            tags TEXT,
            hot INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_no TEXT UNIQUE,
            user_id TEXT,
            user_name TEXT,
            user_phone TEXT,
            user_address TEXT,
            delivery_type TEXT DEFAULT 'delivery',
            delivery_status TEXT DEFAULT 'pending',
            delivery_notes TEXT,
            items TEXT,
            total_price REAL,
            discount REAL DEFAULT 0,
            final_price REAL,
            payment_method TEXT DEFAULT 'wechat',
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // 如果delivery_status列不存在，添加它
    try {
        db.run("ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'pending'");
    } catch (e) {}
    try {
        db.run("ALTER TABLE orders ADD COLUMN delivery_notes TEXT");
    } catch (e) {}
    
    db.run(`
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE,
            name TEXT,
            level TEXT DEFAULT 'normal',
            points INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // 检查是否有管理员
    const adminExists = db.exec("SELECT COUNT(*) FROM admin")[0];
    if (!adminExists || adminExists.values[0][0] === 0) {
        // 管理员密码改为6位数字：123456
        db.run("INSERT INTO admin (username, password) VALUES ('admin', '123456')");
    }
    
    // 检查是否有初始数据
    const bannerCount = db.exec("SELECT COUNT(*) FROM banners")[0];
    if (!bannerCount || bannerCount.values[0][0] === 0) {
        db.run("INSERT INTO banners (image, sort_order, status) VALUES ('999.jpg', 1, 'active')");
        db.run("INSERT INTO banners (image, sort_order, status) VALUES ('898.jpg', 2, 'active')");
        db.run("INSERT INTO banners (image, sort_order, status) VALUES ('test.jpg', 3, 'active')");
    }
    
    const categoryCount = db.exec("SELECT COUNT(*) FROM categories")[0];
    if (!categoryCount || categoryCount.values[0][0] === 0) {
        const categories = [
            ['底料蘸料', '底料蘸料', '鍋スープの素', 'Sauces & Broth', '🍲'],
            ['肉类拼盘', '肉类拼盘', '肉类拼盘', 'Meat Platters', '🥩'],
            ['海鲜系列', '海鲜系列', '海鲜系列', 'Seafood', '🦐'],
            ['蔬菜菌菇', '蔬菜菌菇', '蔬菜菌菇', 'Vegetables', '🥬'],
            ['豆制品', '豆制品', '豆制品', 'Tofu Products', '🧈'],
            ['主食小吃', '主食小吃', '主食小吃', 'Noodles & Snacks', '🍜'],
            ['饮料酒水', '饮料酒水', '饮料酒水', 'Drinks', '🥤'],
            ['锅具餐具', '锅具餐具', '锅具餐具', 'Cookware', '🍴']
        ];
        categories.forEach((c, i) => {
            db.run("INSERT INTO categories (name, name_zh, name_ja, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)", c.concat(i + 1));
        });
    }
    
    const productCount = db.exec("SELECT COUNT(*) FROM products")[0];
    if (!productCount || productCount.values[0][0] === 0) {
        const products = [
            ['麻辣牛油锅底 500g', '麻辣牛油锅底 500g', 'マーラー牛脂鍋スープ 500g', 'Spicy Tallow Hotpot Soup 500g', 29.9, 39.9, 1, 'product_01.jpg', 100, '热销', 1],
            ['番茄浓汤锅底 500g', '番茄浓汤锅底 500g', 'トマトクリーム鍋スープ 500g', 'Tomato Creamy Hotpot Soup 500g', 25.9, 35.9, 1, 'product_02.jpg', 80, '新品', 0],
            ['肥牛卷 300g', '肥牛卷 300g', '肥牛巻き 300g', 'Beef Roll 300g', 39.9, 49.9, 2, 'product_03.jpg', 50, '爆款', 1],
            ['嫩滑牛肉片 250g', '嫩滑牛肉片 250g', '柔らか牛肉スライス 250g', 'Tender Beef Slice 250g', 45.9, 55.9, 2, 'product_04.jpg', 40, '', 1],
            ['手切鲜毛肚 200g', '手切鲜毛肚 200g', '手切り毛肚 200g', 'Hand-cut Fresh Tripe 200g', 52.9, 62.9, 2, 'product_05.jpg', 30, '必点', 1],
            ['鲜虾滑 200g', '鲜虾滑 200g', '新鮮エビ団子 200g', 'Fresh Shrimp Paste 200g', 28.9, 35.9, 3, 'product_06.jpg', 60, '', 0],
            ['鲍鱼 4只装', '鲍鱼 4只装', 'アワビ 4個入り', 'Abalone 4pcs', 68.9, 88.9, 3, 'product_07.jpg', 25, '高端', 0],
            ['娃娃菜 300g', '娃娃菜 300g', '白菜 300g', 'Baby Bok Choy 300g', 9.9, 12.9, 4, 'product_08.jpg', 200, '', 0],
            ['金针菇 200g', '金针菇 200g', 'エリンギ 200g', 'Enoki Mushroom 200g', 8.9, 11.9, 4, 'product_09.jpg', 150, '', 0],
            ['嫩豆腐 300g', '嫩豆腐 300g', '柔らか豆腐 300g', 'Silken Tofu 300g', 6.9, 8.9, 5, 'product_10.jpg', 100, '', 0],
            ['手工面筋 200g', '手工面筋 200g', '手打ち麩 200g', 'Hand-made Wheat Gluten 200g', 12.9, 16.9, 5, 'product_11.jpg', 5, '低库存', 0],
            ['火锅面 500g', '火锅面 500g', '火鍋麺 500g', 'Hotpot Noodles 500g', 8.9, 12.9, 6, 'product_12.jpg', 80, '', 0],
            ['冰粉 2人份', '冰粉 2人份', '氷粉 2人前', 'Ice Jelly 2 Servings', 15.9, 19.9, 6, 'product_13.jpg', 60, '解辣', 1],
            ['王老吉凉茶 310ml', '王老吉凉茶 310ml', '王老吉ハーバーティー 310ml', 'Wang Lao Ji Herbal Tea 310ml', 5.9, 7.9, 7, 'product_14.jpg', 100, '', 0],
            ['唯怡豆奶 450ml', '唯怡豆奶 450ml', 'ウィエイ豆乳 450ml', 'Yibai Soy Milk 450ml', 8.9, 11.9, 7, 'product_15.jpg', 80, '', 0],
            ['芝麻蘸料包 5包', '芝麻蘸料包 5包', '胡麻たれ 5パック', 'Sesame Dipping Sauce 5pcs', 9.9, 14.9, 1, 'product_16.jpg', 120, '', 0],
            ['一次性火锅锅', '一次性火锅锅', '使い捨て鍋', 'Disposable Hotpot Pot', 19.9, 29.9, 8, 'product_17.jpg', 50, '', 0],
            ['一次性火锅套装', '一次性火锅套装', '使い捨て鍋セット', 'Disposable Hotpot Set', 39.9, 49.9, 8, 'product_18.jpg', 30, '热销', 1]
        ];
        products.forEach(p => {
            db.run("INSERT INTO products (name, name_zh, name_ja, name_en, price, original_price, category_id, image, stock, tags, hot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", p);
        });
    }
    
    saveDB();
    console.log('Database initialized');
}

function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// API路由
app.get('/api/banners', (req, res) => {
    const result = db.exec("SELECT * FROM banners WHERE status = 'active' ORDER BY sort_order");
    if (result.length === 0) return res.json([]);
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
    res.json(data);
});

app.get('/api/categories', (req, res) => {
    const result = db.exec("SELECT * FROM categories ORDER BY sort_order");
    if (result.length === 0) return res.json([]);
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
    res.json(data);
});

app.get('/api/products', (req, res) => {
    const { category_id, status, hot } = req.query;
    let sql = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];
    
    if (category_id) {
        sql += ` AND p.category_id = ?`;
        params.push(category_id);
    }
    if (status) {
        sql += ` AND p.status = ?`;
        params.push(status);
    }
    if (hot === 'true') {
        sql += ` AND p.hot = 1`;
    }
    sql += ` ORDER BY p.id`;
    
    const result = db.exec(sql, params);
    if (result.length === 0) return res.json([]);
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
            if (col === 'tags' && row[i]) {
                try { obj.tags_array = JSON.parse(row[i]); } catch { obj.tags_array = row[i] ? [row[i]] : []; }
            }
        });
        return obj;
    });
    res.json(data);
});

app.post('/api/orders', (req, res) => {
    const { user_id, user_name, user_phone, user_address, delivery_type, items, total_price, discount, payment_method } = req.body;
    const order_no = 'ORD' + Date.now();
    const final_price = total_price - (discount || 0);
    
    // 如果手机号存在，自动关联会员
    if (user_phone) {
        const existMember = db.exec(`SELECT id FROM members WHERE phone = '${user_phone}'`);
        if (existMember.length === 0 || existMember[0].values.length === 0) {
            // 自动创建会员
            db.run("INSERT INTO members (phone, name, level, points, status) VALUES (?, ?, 'normal', 0, 'active')",
                [user_phone, user_name || '']);
        }
    }
    
    db.run(`INSERT INTO orders (order_no, user_id, user_name, user_phone, user_address, delivery_type, items, total_price, discount, final_price, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_no, user_phone, user_name, user_phone, user_address, delivery_type, JSON.stringify(items), total_price, discount || 0, final_price, payment_method || 'wechat']);
    saveDB();
    res.json({ success: true, order_no, final_price });
});

app.get('/api/admin/orders', (req, res) => {
    const result = db.exec("SELECT * FROM orders ORDER BY created_at DESC");
    if (result.length === 0) return res.json([]);
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        if (obj.items) {
            try { obj.items_array = JSON.parse(obj.items); } catch { obj.items_array = []; }
        }
        return obj;
    });
    res.json(data);
});

app.put('/api/admin/orders/:id', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    
    // 同步配送状态
    const statusMap = {
        'paid': 'pending',
        'preparing': 'preparing',
        'shipping': 'shipping',
        'completed': 'delivered',
        'cancelled': 'cancelled'
    };
    if (statusMap[status]) {
        db.run("UPDATE orders SET delivery_status = ? WHERE id = ?", [statusMap[status], req.params.id]);
    }
    
    saveDB();
    res.json({ success: true });
});

app.post('/api/admin/products', (req, res) => {
    const { name, name_zh, name_ja, name_en, price, original_price, category_id, image, stock, tags, hot } = req.body;
    db.run(`INSERT INTO products (name, name_zh, name_ja, name_en, price, original_price, category_id, image, stock, tags, hot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, name_zh || name, name_ja || name, name_en || name, price, original_price, category_id, image, stock || 100, tags, hot ? 1 : 0]);
    saveDB();
    res.json({ success: true });
});

app.put('/api/admin/products/:id', (req, res) => {
    const { name, name_zh, name_ja, name_en, price, original_price, category_id, image, stock, tags, hot, status } = req.body;
    db.run(`UPDATE products SET name=?, name_zh=?, name_ja=?, name_en=?, price=?, original_price=?, category_id=?, image=?, stock=?, tags=?, hot=?, status=? WHERE id=?`,
        [name, name_zh || name, name_ja || name, name_en || name, price, original_price, category_id, image, stock, tags, hot ? 1 : 0, status, req.params.id]);
    saveDB();
    res.json({ success: true });
});

app.delete('/api/admin/products/:id', (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
    saveDB();
    res.json({ success: true });
});

app.post('/api/admin/banners', (req, res) => {
    const { image, sort_order } = req.body;
    db.run("INSERT INTO banners (image, sort_order, status) VALUES (?, ?, 'active')", [image, sort_order || 0]);
    saveDB();
    res.json({ success: true });
});

app.delete('/api/admin/banners/:id', (req, res) => {
    db.run("DELETE FROM banners WHERE id = ?", [req.params.id]);
    saveDB();
    res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const result = db.exec("SELECT * FROM admin WHERE username = ? AND password = ?", [username, password]);
    if (result.length === 0 || result[0].values.length === 0) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    res.json({ success: true, token: 'admin_token_' + Date.now() });
});

app.get('/api/admin/stats', (req, res) => {
    const ordersResult = db.exec("SELECT COUNT(*) as count, COALESCE(SUM(final_price), 0) as total FROM orders");
    const productsResult = db.exec("SELECT COUNT(*) as count FROM products WHERE status = 'active'");
    const todayOrders = db.exec("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')");
    const pendingOrders = db.exec("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending','paid','preparing','shipping')");
    const shippingOrders = db.exec("SELECT COUNT(*) as count FROM orders WHERE status = 'shipping'");
    
    res.json({
        totalOrders: ordersResult[0]?.values[0]?.[0] || 0,
        totalRevenue: ordersResult[0]?.values[0]?.[1] || 0,
        totalProducts: productsResult[0]?.values[0]?.[0] || 0,
        todayOrders: todayOrders[0]?.values[0]?.[0] || 0,
        pendingOrders: pendingOrders[0]?.values[0]?.[0] || 0,
        shippingOrders: shippingOrders[0]?.values[0]?.[0] || 0
    });
});

// 库存管理
app.get('/api/admin/stock', (req, res) => {
    const threshold = parseInt(req.query.threshold) || 20;
    const result = db.exec(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.stock <= ${threshold} ORDER BY p.stock ASC`);
    const lowStockCount = db.exec(`SELECT COUNT(*) FROM products WHERE stock <= ${threshold}`)[0]?.values[0]?.[0] || 0;
    
    if (result.length === 0) return res.json({ products: [], lowStockCount: 0 });
    
    const columns = result[0].columns;
    const products = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
    
    res.json({ products, lowStockCount });
});

// 财务管理
app.get('/api/admin/finance', (req, res) => {
    const totalResult = db.exec("SELECT COALESCE(SUM(final_price), 0) as total FROM orders WHERE status = 'completed'");
    const monthResult = db.exec("SELECT COALESCE(SUM(final_price), 0) as total FROM orders WHERE status = 'completed' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')");
    const todayResult = db.exec("SELECT COALESCE(SUM(final_price), 0) as total FROM orders WHERE status = 'completed' AND DATE(created_at) = DATE('now')");
    const completedOrders = db.exec("SELECT COUNT(*) FROM orders WHERE status = 'completed'")[0]?.values[0]?.[0] || 0;
    
    // 收入来源
    const deliveryResult = db.exec("SELECT COALESCE(SUM(final_price), 0) FROM orders WHERE status = 'completed' AND delivery_type = 'delivery'");
    const pickupResult = db.exec("SELECT COALESCE(SUM(final_price), 0) FROM orders WHERE status = 'completed' AND delivery_type = 'pickup'");
    
    res.json({
        totalRevenue: totalResult[0]?.values[0]?.[0] || 0,
        monthRevenue: monthResult[0]?.values[0]?.[0] || 0,
        todayRevenue: todayResult[0]?.values[0]?.[0] || 0,
        completedOrders,
        deliveryRevenue: deliveryResult[0]?.values[0]?.[0] || 0,
        pickupRevenue: pickupResult[0]?.values[0]?.[0] || 0
    });
});

// 订单趋势 (最近7天)
app.get('/api/admin/order-trend', (req, res) => {
    const result = db.exec(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM orders 
        WHERE created_at >= DATE('now', '-6 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    `);
    
    if (result.length === 0) return res.json([]);
    
    const data = result[0].values.map(row => ({
        date: row[0],
        count: row[1]
    }));
    
    res.json(data);
});

// 收入趋势 (最近7天)
app.get('/api/admin/revenue-trend', (req, res) => {
    const result = db.exec(`
        SELECT DATE(created_at) as date, COALESCE(SUM(final_price), 0) as revenue 
        FROM orders 
        WHERE status = 'completed' AND created_at >= DATE('now', '-6 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    `);
    
    if (result.length === 0) return res.json([]);
    
    const data = result[0].values.map(row => ({
        date: row[0],
        revenue: row[1]
    }));
    
    res.json(data);
});

// 配送管理
app.get('/api/admin/delivery', (req, res) => {
    const { status } = req.query;
    let sql = "SELECT * FROM orders WHERE delivery_type = 'delivery'";
    if (status) {
        sql += ` AND delivery_status = '${status}'`;
    } else {
        sql += " AND delivery_status IN ('pending','preparing','shipping')";
    }
    sql += " ORDER BY created_at DESC";
    
    const result = db.exec(sql);
    if (result.length === 0) return res.json([]);
    
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
    
    res.json(data);
});

// 更新配送状态
app.put('/api/admin/delivery/:orderNo', (req, res) => {
    const { status } = req.body;
    const orderNo = req.params.orderNo;
    
    db.run("UPDATE orders SET delivery_status = ? WHERE order_no = ?", [status, orderNo]);
    
    // 如果是完成，更新主状态
    if (status === 'delivered') {
        db.run("UPDATE orders SET status = 'completed' WHERE order_no = ?", [orderNo]);
    }
    
    saveDB();
    res.json({ success: true });
});

// 会员管理
app.get('/api/admin/members', (req, res) => {
    // 获取会员及其订单统计
    const result = db.exec(`
        SELECT m.*, COUNT(o.id) as order_count, COALESCE(SUM(o.final_price), 0) as total_spent
        FROM members m
        LEFT JOIN orders o ON o.user_id = m.phone
        GROUP BY m.id
        ORDER BY m.created_at DESC
    `);
    
    if (result.length === 0) return res.json([]);
    
    const columns = result[0].columns;
    const data = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
    
    res.json(data);
});

app.post('/api/admin/members', (req, res) => {
    const { phone, name, level, points, status } = req.body;
    
    // 检查是否已存在
    const exist = db.exec(`SELECT id FROM members WHERE phone = '${phone}'`);
    if (exist.length > 0 && exist[0].values.length > 0) {
        return res.status(400).json({ success: false, message: '该手机号已注册' });
    }
    
    db.run("INSERT INTO members (phone, name, level, points, status) VALUES (?, ?, ?, ?, ?)",
        [phone, name, level || 'normal', points || 0, status || 'active']);
    saveDB();
    res.json({ success: true });
});

app.put('/api/admin/members/:id', (req, res) => {
    const { phone, name, level, points, status } = req.body;
    db.run("UPDATE members SET phone=?, name=?, level=?, points=?, status=? WHERE id=?",
        [phone, name, level, points, status, req.params.id]);
    saveDB();
    res.json({ success: true });
});

app.delete('/api/admin/members/:id', (req, res) => {
    db.run("DELETE FROM members WHERE id = ?", [req.params.id]);
    saveDB();
    res.json({ success: true });
});

// 文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    res.json({ success: true, filename: req.file.filename });
});

app.get('/api/images', (req, res) => {
    const files = fs.readdirSync('images').filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    res.json(files);
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
