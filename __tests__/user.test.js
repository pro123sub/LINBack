const request = require('supertest');
const app = require('../server');
const faker = require('faker');

describe('User API Endpoints', () => {
  const userData = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    phone: `+91${faker.phone.phoneNumber('9#########')}`,
    password: "Password@123",
    dob: faker.date.past(30, new Date('2000-01-01')).toISOString(),
    gender: faker.random.arrayElement(["Male", "Female", "Other"]),
    address: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    postalCode: faker.address.zipCode('######'),
    aadhaarNumber: "123456789123", // valid 12-digit Aadhaar
    panNumber: "ABCDE1234F",
    annualIncome: 500000,
    employmentType: "Salaried",
    employerName: faker.company.companyName()
  };

  let token;
  let otp;

  it('✅ should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toEqual(userData.email);

    token = res.body.token;
  });

  it('✅ should request Aadhaar OTP', async () => {
    const res = await request(app)
      .post('/api/users/request-otp')
      .send({ email: userData.email });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("otp"); // simulated OTP
    otp = res.body.otp;
  });

  it('✅ should verify Aadhaar OTP', async () => {
    const res = await request(app)
      .post('/api/users/verify-otp')
      .send({ email: userData.email, otp });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Aadhaar verified successfully.");
  });

  it('✅ should login the user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toEqual(userData.email);

    token = res.body.token; // refresh token
  });

   it('✅ get profile', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(userData.email);
  });

  it('✅ should update user profile (/update)', async () => {
    const updatedData = { city: "New Test City", state: "Updated State" };

    const res = await request(app)
      .put('/api/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Profile updated successfully.");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("city", "New Test City");
    expect(res.body.user).toHaveProperty("state", "Updated State");
  });
});
