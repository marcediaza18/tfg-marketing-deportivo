import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductCategory =
  | 'representacion'
  | 'patrocinio'
  | 'organizacion_eventos'
  | 'comunicacion'
  | 'marketing_digital'
  | 'consultoria'
  | 'otro';

export interface IProduct extends Document {
  name: string;
  category: ProductCategory;
  description?: string;
  basePriceEUR: number;
  isActive: boolean;
  unitsSold: number;
  revenueEUR: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    category: {
      type: String,
      enum: [
        'representacion',
        'patrocinio',
        'organizacion_eventos',
        'comunicacion',
        'marketing_digital',
        'consultoria',
        'otro',
      ],
      default: 'otro',
      index: true,
    },
    description: String,
    basePriceEUR: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    unitsSold: { type: Number, default: 0, min: 0 },
    revenueEUR: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
