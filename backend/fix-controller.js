const fs = require('fs');
const content = fs.readFileSync('src/controllers/templateController.js', 'utf8');

// If fileUrl is http:// or https://, just redirect to it!
const newContent = content.replace(
  `    const filePath = path.join(__dirname, '../../', template.fileUrl);`,
  `    if (template.fileUrl && template.fileUrl.startsWith('http')) {
      return res.redirect(template.fileUrl);
    }
    const filePath = path.join(__dirname, '../../', template.fileUrl);`
);
fs.writeFileSync('src/controllers/templateController.js', newContent);
