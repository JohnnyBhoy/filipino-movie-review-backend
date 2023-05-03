const { getAppInfo } = require("../controllers/admin");
const { isAuth, isAdmin } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/app-info", isAuth, isAdmin, getAppInfo);

module.exports = router;
