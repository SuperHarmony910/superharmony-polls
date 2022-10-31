import mongoose from 'mongoose';
const { Schema } = mongoose;
import { PollSubmission } from '../models/pollModels';

const pollSchema = new Schema(PollSubmission);

const Model = mongoose.model('pollModel', pollSchema)