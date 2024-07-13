const express = require('express');
const router = express.Router();
const Product = require('./models/Product');

//for upload
router.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).send(product);
    } catch (err) {
        res.status(400).send(err);
    }
});

//searching products
router.get('/products', async (req, res) => {
    try {
        const { productName, minRating, maxRating, minPrice, maxPrice, dateAdded } = req.query;
        let query = {};

        if (productName) {
            query.productName = { $regex: new RegExp(productName, 'i') };
        }
        if (minRating && maxRating) {
            query.averageRating = { $gte: parseFloat(minRating), $lte: parseFloat(maxRating) };
        }
        if (minPrice && maxPrice) {
            query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        }
        if (dateAdded) {
            query.dateAdded = { $gte: new Date(dateAdded) };
        }

        const products = await Product.find(query);
        res.send(products);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/products/all', async (req, res) => {
    try {
        const products = await Product.find();
        res.send(products);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;

// configure express 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', productRoutes);

mongoose.connect('mongodb://localhost:27017/productDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});
