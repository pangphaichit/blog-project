function validatePostData(req, res, next) {
    const requiredFields = [
      { name: 'title', type: 'string' },
      { name: 'image', type: 'string' },
      { name: 'category_id', type: 'number' },
      { name: 'description', type: 'string' },
      { name: 'content', type: 'string' },
      { name: 'status_id', type: 'number' },
    ];
  
    for (const field of requiredFields) {
      const value = req.body[field.name];
  
      // Check for required fields
      if (!value) {
        return res.status(400).json({ message: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required` });
      }
  
      // Check for type validity
      if (typeof value !== field.type) {
        return res.status(400).json({ message: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} must be a ${field.type}` });
      }
    }
  
    next();
  }
  
  export default validatePostData;
  