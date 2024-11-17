import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const startAuthenticatedSession = (req, user) => {
  return new Promise((fulfill, reject) => {
    req.session.regenerate((err) => {
      if (!err) {
        req.session.user = user; 
        fulfill(user);
      } else {
        reject(err);
      }
    });
  });
};

const endAuthenticatedSession = req => {
  return new Promise((fulfill, reject) => {
    req.session.destroy(err => err ? reject(err) : fulfill(null));
  });
};


const register = async (username, password) => {
  if(username.length>3 && password.length>0){
    const found= await User.findOne({username:username});
    if(found){
      throw({message: 'USERNAME ALREADY EXISTS'});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      username:username,
      password:hashedPassword,
      preference: [],
      queryEmbed: [],
    });
    await user.save();
    return user;
  }else{
    throw({message: 'USERNAME PASSWORD TOO SHORT'});
  }
};

const login = async (username, password) => {
  const user=await User.findOne({username:username});
  if(user){
    const match=await bcrypt.compare(password,user.password);
    if(!match){
      throw ({message: 'PASSWORDS DO NOT MATCH'});
    }
    return user;
  }else{
    throw ({message: 'USER NOT FOUND'});
  }
};

export{
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login
};