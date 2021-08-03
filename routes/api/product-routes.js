const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  // Include its associated Category and Tag data
  router.get("/", async (req, res) => {
    try {
      const productData = await Product.findAll({
        attributes: ["id", "product_name", "price", "stock", "category_id"],
        include: [
          {
            model: Category,
            attributes: ["id", "category_name"],
          },
          {
            model: Tag,
            attributes: ["id", "tag_name"],
          },
        ],
      });
      res.status(200).json(productData);
    } catch (err) {
      res.status(400).json(err);
    }
  });
});

// GET one product
router.get("/:id", (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  router.get("/:id", async (req, res) => {
    try {
      const productData = await Product.findByPk(req.params.id, {
        include: [
          {
            model: Category,
            attributes: ["id", "category_name"],
          },
          {
            model: Tag,
            attributes: ["id", "tag_name"],
          },
        ],
      });
      if (!productData) {
        res.status(404).json({ message: "No product found with this id!" });
        return;
      }
      res.status(200).json(productData);
    } catch (err) {
      res.status(400).json(err);
    }
  });
});

// CREATE new product
router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// UPDATE product - Need to by ID
router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      //by association
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // REMOVE products
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // Need to console.log(err) so it shows to end user
      res.status(400).json(err);
    });
});

router.delete("/:id", (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productData) {
      return res
        .status(404)
        .json({ message: "There is no product with that id." });
    }
    res.json(productData);
  } catch (err) {
    res.status(404).json(err);
  }
});

module.exports = router;
