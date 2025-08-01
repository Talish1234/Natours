//import {login,logout} from './login';

const stripe = Stripe('pk_test_51OC7s0SFktuTX1Qn6JW1Tr3bR4oFCpWEG2c9PVwmNXgBCy1aEAkB80iK7mmsE0xkV8Yu19wV1aAJqN0Q0mFacFLN001xNK4UvD');

const bookTour = async tourId =>{
  try{
  const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
  await stripe.redirectToCheckout({ sessionId: session.data.session.id })
  }
  catch(err){
    alert('something went worng');
  }
}

const login = async (email,password) => {
  try{
const res = await axios({
  method: 'POST',
  url:'/api/v1/users/login',
  data:{
      email,
      password
  }
});

if(res.data.status === 'success'){
  alert('Logged in successfully!');
  window.setTimeout(() => {
      location.assign('/');
  },1000);
}
}catch(err){
alert('invalid email or password');
}
}

const sendReview = async (review,rating,tour,user) => {
  try{
  const res = await axios({
    method:'POST',
    url:'/api/v1/reviews/',
    data:{
      review,
      rating,
      tour,
      user
    }
  });
  if(res.data.status === 'success')
  alert('Successfully sended');
  location.reload(true);
  }catch(err){
    alert('Somthing went worng!');
  }
}

const logout = async () => {
  try{
    const res = await axios({
      method:'GET',
      url:'/api/v1/users/logout'
    });

    if(res.data.status === 'success')
    location.assign('/');
  }catch(err){
    alert('Error logging out! Try again.');
  }
}
const signup = async (name,email,password,passwordConfirm) => {
  try{
const res = await axios({
  method: 'POST',
  url:'/api/v1/users/signin',
  data:{
      name,
      email,
      password,
      passwordConfirm
  }
});

if(res.data.status === 'success'){
  alert('SignUp successfully!');
  window.setTimeout(() => {
      location.assign('/');
  },1000);
}
}catch(err){
  console.log(err);
alert('Something went worng!');
}
}

const updateSettings = async (data,type) =>{
  try{
    const url = type === 'password' ? '/api/v1/users/updatePassword':'/api/v1/users/updateme' ;
    const res = await axios({
      method:'PATCH',
      url,
      data
    });
    
    if(res.data.status === 'success'){
      alert('successfully updated');
      location.reload(true);
    }
    }catch(err){
    alert('Something went worng!');
    }
};

const deleteReview = async (reviewid) => {
  try{
const res = await axios({
  method:'DELETE',
  url:`/api/v1/reviews/${reviewid}`
});
if(res.data.status === 'success')
alert('Successful!');
location.reload(true);
}
catch(err){
  alert('Something went worng!');
}
};

const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const reviewBtn = document.querySelector('.form--review');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const deleteReviewBtn = document.querySelectorAll('.deleteReview');

if(loginForm)
loginForm.addEventListener('submit',e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value; 
    
    login(email,password);
})

if(signupForm)
signupForm.addEventListener('submit',el=>{
  el.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  document.querySelector('.btn').textContent = 'Processing...';
  signup(name,email,password,passwordConfirm);
});

if(logOutBtn)
logOutBtn.addEventListener('click',logout);

if(reviewBtn)
reviewBtn.addEventListener('submit',el =>{

el.preventDefault();
const ratingObj = document.getElementsByName('rating');
const review = document.getElementById('review').value;
let rating;

for (i = 0; i < ratingObj.length; i++) 
  if (ratingObj[i].checked)
  rating = ratingObj[i].value;

  document.querySelector('.btn').textContent = 'Sending...';
  const {tourid,userid} = el.target.dataset;
  sendReview(review,rating,tourid,userid);
});

if(userDataForm)
userDataForm.addEventListener('submit',el => {
  el.preventDefault();
  const form = new FormData();
  form.append('name',document.getElementById('name').value);
  form.append('email',document.getElementById('email').value);
  form.append('photo',document.getElementById('photo').files[0]);
  updateSettings(form,'data')
});

if(userPasswordForm)
userPasswordForm.addEventListener('submit',el => {
  el.preventDefault();
  document.querySelector('.btn--save-password').textContent = 'Updating...';
  const currentPassword = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('password-confirm').value;
  updateSettings({currentPassword,password,confirmPassword},'password');


  document.querySelector('.btn--save-password').textContent = 'Save password';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
})

if(bookBtn)
 bookBtn.addEventListener('click',e=>{
  e.target.textContent = 'Processing...';
  const {tourid} = e.target.dataset;
  bookTour(tourid);
 })

if(deleteReviewBtn)
deleteReviewBtn.forEach(item => {
item.addEventListener('click',e=>{
  e.target.textContent = 'Processing...';
  const {reviewid} =  e.target.dataset;
  deleteReview(reviewid);
})
})
