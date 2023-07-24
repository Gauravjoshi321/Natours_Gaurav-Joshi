const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('there is no such document with this id', 404));

    res.status(204).json({
      status: "success",
      data: "null"
    })
  })


exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      // upsert: true
    })

    if (!doc) return next(new AppError('there is no such document with this id to update', 404));

    res.status(201).json({
      status: "success",
      data: doc
    })
  })

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc
      }
    })
  })


exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOption)
      query = query.populate(populateOption);

    const tour = await query;

    if (!tour) return next(new AppError('there is no such document with this id', 404));

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    })
  })

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // EXECUTION
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitingFields().pagination();
    const doc = await features.query;

    res.status(200).json({
      status: "success",
      data: {
        size: doc.length,
        data: doc
      }
    })
  })
