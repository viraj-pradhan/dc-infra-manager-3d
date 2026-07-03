import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopology extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  devices: any[];
  links: any[];
  createdAt: Date;
}

const TopologySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  devices: { type: Array, default: [] },
  links: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Topology: Model<ITopology> = mongoose.models.Topology || mongoose.model<ITopology>('Topology', TopologySchema);

export default Topology;
