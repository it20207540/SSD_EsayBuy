const router = require("express").Router();

const AddressBook = require("../../Models/Janani/address-book");
const PaymentOptions = require("../../Models/Janani/payment-options");
const User = require("../../Models/Janani/user");
const Order = require("../../Models/Thivanka/order");
const JWT = require("../../auth/jwt");
const tokenKey = process.env.TOKEN_KEY;
const jwtAuth = new JWT(tokenKey);
const { authentication } = require("../../auth/authentication");
//user registration routes
router.route("/data/save").post(async (req, res) => {
  const { name, email, country, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.json({ status: false, message: "This user already exists!" });
    } else {
      const details = new User({
        name: name,
        mobile: "0000000000",
        bdate: "0",
        email: email,
        country: country,
        password: password,
      });

      await details.save();
      res.json({ status: true, message: "Registration Done!" });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.json({ status: false, message: "Something went wrong!" });
  }
});

router.route("/login/:email/:password").get((req, res) => {
  let email = req.params.email;
  let pass = req.params.password;
  User.findOne({
    $and: [{ email: { $eq: email } }, { password: { $eq: pass } }],
  })
    .then((data) => {
      User.updateOne(
        { email: email },
        { $set: { loginDate: new Date() } }
      ).then((updatedData) => {
        let cookies = jwtAuth.generateToken("hi");
        res.cookie("token", cookies, {
          httpOnly: true,
          // secure: true,
        });
        res.json(data);
      });
    })
    .catch((error) => {
      res.json(error);
    });
});

router.route("/password/change/:email").put(async (req, res) => {
  const email = req.params.email;
  const { password } = req.body;

  User.updateOne({ email: email }, { $set: { password: password } })
    .then((data) => {
      res.json({ status: data.acknowledged });
    })
    .catch((err) => {
      res.json({ status: false, err });
    });
});

router.route("/details/update/:email").put(authentication, async (req, res) => {
  const email = req.params.email;
  const data = req.body;
  User.updateOne({ email: email }, { $set: data })
    .then((data) => {
      res.json({ status: data.acknowledged });
    })
    .catch((err) => {
      res.json({ status: false, err });
    });
});

router.route("/details/remove/:email").get(authentication, async (req, res) => {
  const email = req.params.email;
  User.findOneAndDelete({ email: { $eq: email } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router
  .route("/details/removebyid/:id")
  .get(authentication, async (req, res) => {
    const id = req.params.id;
    User.findOneAndDelete({ _id: { $eq: id } })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  });

router.route("/details/get/:email").get(authentication, async (req, res) => {
  const email = req.params.email;
  User.findOne({ email: { $eq: email } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.route("/details/getall").get(authentication, async (req, res) => {
  User.find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});
//shipping address routes
router.route("/address/add").post(authentication, async (req, res) => {
  const { personalInformation, email, country, address, mobile } = req.body;
  const user = User.find({ email: { $eq: email } });
  if (!user) {
    res.json({ status: false, message: "This user is alraedy exist!" });
  } else {
    const details = new AddressBook({
      personalInfo: personalInformation,
      mobile: mobile,
      email: email,
      country: country,
      address: address,
    });
    await details
      .save()
      .then(() => {
        res.json({
          status: true,
          message: "Address Added!",
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          message: "Something went wrong!",
        });
      });
  }
});

router.route("/address/get/:email").get(authentication, async (req, res) => {
  const email = req.params.email;
  AddressBook.find({ email: { $eq: email } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.route("/address/getbyid/:id").get(authentication, async (req, res) => {
  const id = req.params.id;
  AddressBook.findOne({ _id: { $eq: id } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.route("/address/update/:id").put(authentication, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  console.log(req);
  AddressBook.updateOne({ _id: id }, { $set: data })
    .then((data) => {
      res.json({ status: data.acknowledged });
    })
    .catch((err) => {
      res.json({ status: false, err });
    });
});

router.route("/address/remove/:id").get(authentication, async (req, res) => {
  const id = req.params.id;
  AddressBook.findOneAndDelete({ _id: { $eq: id } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

//payment routes
router.route("/payment-options/add").post(authentication, async (req, res) => {
  const { cardName, cardNumber, cvv, expireDate, cardType, email } = req.body;
  console.log(req.body);
  const user = User.find({ email: { $eq: email } });
  if (!user) {
    res.json({ status: false, message: "This user is alraedy exist!" });
  } else {
    const details = new PaymentOptions({
      cardName: cardName,
      cardNumber: cardNumber,
      email: email,
      cvv: cvv,
      expireDate: expireDate,
      cardType: cardType,
    });
    await details
      .save()
      .then(() => {
        res.json({
          status: true,
          message: "Payment option Added!",
        });
      })
      .catch((err) => {
        res.json({
          status: false,
          message: "Something went wrong!",
        });
      });
  }
});

router
  .route("/payment-options/remove/:id")
  .get(authentication, async (req, res) => {
    const id = req.params.id;
    PaymentOptions.findOneAndDelete({ _id: { $eq: id } })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  });

router
  .route("/payment-options/get/:email")
  .get(authentication, async (req, res) => {
    const email = req.params.email;
    PaymentOptions.find({ email: { $eq: email } })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  });

//payment routes

module.exports = router;
