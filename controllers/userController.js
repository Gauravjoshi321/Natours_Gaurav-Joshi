const multer = require('multer');
const sharp = require('sharp');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     // fileName = userId_current time stamp_ext
//     const fileName = `user-${req.user._id}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image. Please upload image only!', 400), false);
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  req.file.buffer = null;

  next();
})

const filterObj = function (obj, ...allowedFields) {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  })

  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;

  next();
}


exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);

  // 1. Create error if POST contain the password to update
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updation. Please use /updateMypassword', 400));
  }

  // 2. Filter the req.body
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Updating the photo of the user
  if (req.file) filteredBody.photo = req.file.filename;

  // 4. Update user's document
  // const user = await User.findById(req.user._id);
  // user.name = 'Jonas';
  // await user.save();

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    user: updatedUser
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: {
      message: 'This route is not defined yet! Use signUp method'
    }
  })
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
