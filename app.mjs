import express from "express";

const app = express();
const port = 4000;

app.get("/profiles", (req, res) => {
  const userProfile = {
    data: {
      name: "john",
      age: 20
    }
  };

  if (!userProfile) {
    return res.status(404).json({
      error: 'User profile not found'
    });
  }

  res.status(200).json(userProfile);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
