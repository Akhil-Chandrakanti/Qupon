router.post('/register', async (req, res) => {
  try {
    console.log("STEP 1 - Register request received");

    const { name, email, phone, password } = req.body;

    console.log("STEP 2 - Checking user");

    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    console.log("STEP 3 - User checked");

    const otp = generateOTP();
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("STEP 4 - Sending email");

    await sendOtpEmail(email, name, otp);

    console.log("STEP 5 - Email sent");

    await pool.query(/* your INSERT query */);

    console.log("STEP 6 - OTP stored");

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});