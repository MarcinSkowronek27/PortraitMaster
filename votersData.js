const Voter = require('./models/voter.model');

const loadVoterData = async () => {

  const data = [
    // {
    //   user: 'admin',
    //   votes: []
    // }
  ];
  try {
    await Voter.create(data);
    console.log('Voter test data has been successfully loaded');
  }
  catch (err) {
    console.log(`Couldn't load test voter data`, err);

  }
};

module.exports = loadVoterData;