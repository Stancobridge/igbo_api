import { NextFunction, Request, Response } from 'express';
import { Connection } from 'mongoose';
import { developerSchema } from '../models/Developer';
import { statSchema } from '../models/Stat';
import { createDbConnection, handleCloseConnection } from '../services/database';
import StatTypes from '../shared/constants/StatTypes';
import { searchForAllDevelopers } from './utils/queries';

export const getStats = async (_: Request, res: Response, next: NextFunction) => {
  const connection: Connection = createDbConnection();
  const Stat = connection.model('Stat', statSchema);
  const Developer = connection.model('Developer', developerSchema);
  try {
    const [
      totalWords,
      totalAudioPronunciations,
      totalNsibidiWords,
      totalDevelopers,
      totalExamples,
      totalIgboDefinitions,
      totalProverbs,
      totalBibleVerses,
    ] = await Promise.all([
      Stat.findOne({ type: StatTypes.SUFFICIENT_WORDS }),
      Stat.findOne({ type: StatTypes.HEADWORD_AUDIO_PRONUNCIATIONS }),
      Stat.findOne({ type: StatTypes.NSIBIDI_WORDS }),
      Developer.find(searchForAllDevelopers()),
      Stat.findOne({ type: StatTypes.SUFFICIENT_EXAMPLES }),
      Stat.findOne({ type: StatTypes.IGBO_DEFINITIONS }),
      Stat.findOne({ type: StatTypes.PROVERB_EXAMPLES }),
      Stat.findOne({ type: StatTypes.BIBLICAL_EXAMPLES }),
    ]);

    const stats = {
      totalWords: totalWords.value,
      totalExamples: totalExamples.value,
      totalAudioPronunciations: totalAudioPronunciations.value,
      totalNsibidiWords: totalNsibidiWords.value,
      totalDevelopers: totalDevelopers.length,
      totalIgboDefinitions: totalIgboDefinitions.value,
      totalProverbs: totalProverbs.value,
      totalBibleVerses: totalBibleVerses.value,
    };
    await handleCloseConnection(connection);
    return res.send(stats);
  } catch (err) {
    await handleCloseConnection(connection);
    return next(err);
  }
};