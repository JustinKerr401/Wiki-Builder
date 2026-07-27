const { Schema, model } = require('mongoose');

const ExportSchema = new Schema({
  title: { type: String, required: true },
  parent: { type: String, required: true},
  bio: { type: String, required: true },
  searchText: {type: String, required: true},
  coverImages: { type: Object, default: {} },
  coverInfo: [{ type: Schema.Types.Mixed }],
  sections: [{ type: Schema.Types.Mixed }], // each section can have any fields
  size: { type: Number, index: true, required: false},
  wiki: {type: String, required: true}
});

ExportSchema.index({
  title: "text",
  bio: "text",
  searchText: "text"
});

module.exports = model('pages', ExportSchema);