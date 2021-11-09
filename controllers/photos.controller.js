const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const pattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/, 'g');
    titleMatched = check => {
      let checkedValue = check.match(pattern).join('');
      return checkedValue;
    }
    // console.log('titleMatched:', titleMatched(title), 'title:', title);
    // const emailPattern = new RegExp(/^(([^<>%()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    // const emailMatched = email.match(emailPattern).join('');
    // if (emailMatched.length < email.length) console.log('zły email');

    if (titleMatched(title).length < title.length ||
      titleMatched(author).length < author.length) throw new Error('Invalid characters...');

    if (!email.includes('@')) throw new Error('Invalid characters...');
    if (title && author && email && file) { // if fields are not empty...
      // alert("hello found inside your_string");
      if (title.length >= 25 || author.length >= 50) alert(new Error('Wrong length of input!'));
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if (fileExt != 'jpg' && fileExt != 'png' && fileExt != 'gif') alert(new Error('Wrong input!'));
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch (err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  // const clientIp = requestIp.getClientIp(req);
  // const checkClientIp = await Voter.findOne({ user: clientIp });
  // console.log(checkClientIp);
  // if (!checkClientIp) {
  //   const newVoter = new Voter({ user: clientIp, votes: [req.params.id] });
  //   await newVoter.save();
  //   console.log('nie ma tego IP w bazie');
  // res.json(newVoter);
  // } else {
  //   console.log('jest to IP już w bazie');
  //   const checkImageId = await Voter.findOne({ data: req.params.id });
  //   if (checkImageId) {
  //     console.log('jest już to zdjęcie w bazie');
  //     res.status(500).json({ message: 'You\'ve once chosen this photo' });
  //   }
  //   else {
  //     const voterToUpdate = new Voter({ user: clientIp, data: req.params.id });
  //     await voterToUpdate.save();
  //     console.log('nie ma tego zdjęcia, więc je dodaj do bazy');
  //     res.json(voterToUpdate);
  //   }

  try {
    const clientIp = requestIp.getClientIp(req);
    const checkClientIp = await Voter.findOne({ user: clientIp });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    // console.log('checkClientIp', checkClientIp);
    if (!checkClientIp) {
      const newVoter = new Voter({ user: clientIp, votes: req.params.id });
      await newVoter.save();
      console.log('nie ma tego IP w bazie, więc dodaję je do bazy');
      console.log(photoToUpdate._id);
    } else {
      const checkPhoto = await Voter.findOne({ user: clientIp, votes: req.params.id });
      if (checkPhoto) res.status(500).json({ message: 'You can not vote twice on the same photo!' });
      else {
        await Voter.updateOne({ user: clientIp }, { $push: { votes: req.params.id } });
      }
    }
    // else {
    //   console.log('jest to IP już w bazie');
    //   console.log('checkPhoto', checkPhoto);
    //   if (checkPhoto) res.status(500).json({ message: 'You can not vote twice on the same photo!' });
    // else {
    //     console.log('nie ma tego zdjęcia, więc je dodaj do bazy');
    //     const voterUpdate = new Voter({ votes: req.params.id });
    //     console.log('voterUpdate:', voterUpdate);
    //     if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    //     else {
    //       photoToUpdate.votes++;
    //       photoToUpdate.save();
    //       res.send({ message: 'OK' });
    //     }
    //   }
    // }
  } catch (err) {
    res.status(500).json(err);
  }

};
