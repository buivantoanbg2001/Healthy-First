const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var addressSchema = new mongoose.Schema({
  street: {
    type: String,
  },
  town: {
    type: String,
  },
  district: {
    type: String,
    lowercase: true,
    minlength: 5,
    maxlength: 30,
  },
  city: {
    type: String,
    // lowercase: true,
    minlength: 5,
    maxlength: 30,
  },
});

var certificationSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  certification_number: {
    type: String,
  },
  MFG: {
    // ngay co chung chi khong the thay doi va co hieu luc luc no duoc tao ra
    type: Date,
  },
  expiration_date: {
    type: Date,
  },

  status: {
    type: String,
  },
});

//fullname address phone_number business_type certification
var foodfacilitySchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: "This field is required.",
      // lowercase: true,
    },
    address: addressSchema,
    phone_number: {
      type: String,
      minlength: 5,
      maxlength: 15,
      lowercase: true,
    },
    business_type: {
      //sản xuất thực phẩm và/hoặc dịch vụ ăn uống
      type: [String],
      lowercase: true,
      // lieu 5 30 cua tung string hay cua ca
      minlength: 5,
      maxlength: 30,
    },
    environment: Boolean,
    appliances: Boolean,
    water_source: Boolean,
    ingredients: Boolean,
    food_preservation: Boolean,
    waste_treatment: Boolean,
    owners: Boolean,
    processing: Boolean,
    certification_number: {
      type: String,
      luppercase: true,
    },
    certification: {
      type: Schema.Types.ObjectId,
      ref: "Certification",
    },
  },
  { timestamps: true }
);

var checkfacilitySchema = new mongoose.Schema({
  start_date: Date,
  food_sample: [
    {
      id: String,
      name: String,
      unit: String,
      start_date: Date,
      end_date: Date,
      result: Boolean,
    },
  ],
  decision: [String],

  confirm: Boolean,

  facility: {
    id: String,
    fullname: {
      type: String,
    },
    certification_number: {
      type: String,
      luppercase: true,
    },
    business_type: {
      //sản xuất thực phẩm và/hoặc dịch vụ ăn uống
      type: [String],
      lowercase: true,
      // lieu 5 30 cua tung string hay cua ca
      minlength: 5,
      maxlength: 30,
    },
    environment: Boolean,
    appliances: Boolean,
    water_source: Boolean,
    ingredients: Boolean,
    food_preservation: Boolean,
    waste_treatment: Boolean,
    owners: Boolean,
    processing: Boolean,
  },

  specialist: String,
});

var foodsamplingSchema = new mongoose.Schema({
  appliances: {
    type: String,
    lowercase: true,
  },
  water_source: {
    type: String,
    lowercase: true,
  },
  ingredients: {
    type: String,
    lowercase: true,
  },
  food_preservation: {
    type: String,
    lowercase: true,
  },
  waste_treatment: {
    type: String,
    lowercase: true,
  },
  owners: {
    type: String,
    lowercase: true,
  },
  processing: {
    type: String,
    lowercase: true,
  },
  business_paper: {
    type: String,
    lowercase: true,
  },
  status: {
    type: String,
    lowercase: true, //da gui giam dinh hay chua
  },
  result: {
    type: String,
    lowercase: true,
  },
  result_date: {
    type: Date,
  },
  foodfacility_number: {
    type: Schema.Types.ObjectId,
    ref: "FoodFacility",
  },
});
//certification: mongoose.Schema.Types.ObjectID
mongoose.model("CheckFacility", checkfacilitySchema);
mongoose.model("FoodSampling", foodsamplingSchema);

mongoose.model("FoodFacility", foodfacilitySchema);
mongoose.model("Certification", certificationSchema);
