var router = require("./index");
const userModel = require("./users");

router.post("/add-category", async (req, res) => {
  const { email, category } = req.body;
  const foundUser = await userModel.findOne({ email: email });
  if (!foundUser) {
    return res.status(200).json({ message: "User Not Found" });
  }
  const categories = foundUser.details.find(
    (detail) => detail.category && detail.category.length > 0
  );
  if (categories) {
    categories.category.push({
      category_name: category,
    });
  } else {
    const newDetails = {
      category: [
        {
          category_name: category,
        },
      ],
    };
    foundUser.details.push(newDetails);
  }
  foundUser.save();
  return res
    .status(200)
    .json({ message: "Added New Category", category: category });
});

router.get("/getCategories", async (req, res) => {
  const email = req.query.email;
  const foundUser = await userModel.findOne({ email: email });
  if (!foundUser) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const categories = foundUser.details.find((res) => res.category && res.category.length > 0);
  return res
    .status(200)
    .json({ message: "User Categories", categories: categories });
});

router.put("/update-category", async (req, res) => {
  const { email, category, updateCategory } = req.body;
  const foundUser = await userModel.findOne({ email: email });
  if (!foundUser) {
    return res.status(200).json({ message: "User Not Found" });
  }
  const categories = foundUser.details.find((res) => res.category);
  const foundCategory = categories.category.find(
    (res) => res.category_name == category
  );
  foundCategory.category_name = updateCategory;
  foundUser.save();
  return res.status(200).json({ message: "Category Updated" });
});

router.delete("/delete-category", async (req, res) => {
  const { email, category } = req.query;
  try {
    const foundUser = await userModel.findOne({ email: email });
    if (!foundUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    foundUser.details[0].category = foundUser.details[0].category.filter(
      (cat) => cat.category_name !== category
    );
    await foundUser.save();
    return res.status(200).json({ message: "Category Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
