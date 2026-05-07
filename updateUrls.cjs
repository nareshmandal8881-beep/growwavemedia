const fs = require('fs');
const files = [
  'src/App.jsx',
  'src/DashboardPage.jsx',
  'src/portal/CreatorDashboard.jsx',
  'src/portal/CreatorLoginPage.jsx',
  'src/portal/CreatorSignupPage.jsx',
  'src/portal/DealSubmitPage.jsx',
  'src/portal/InvoiceView.jsx',
  'src/portal/components/CommentThread.jsx',
  'src/components/EnrollmentModal.jsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/const API_BASE = ['"]http:\/\/localhost:5000\/api['"];/g, "const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';");
  content = content.replace(/['"]http:\/\/localhost:5000\/api\/leads['"]/g, "(import.meta.env.PROD ? '/api/leads' : 'http://localhost:5000/api/leads')");
  content = content.replace(/['"]http:\/\/localhost:5000\/api\/creators['"]/g, "(import.meta.env.PROD ? '/api/creators' : 'http://localhost:5000/api/creators')");
  content = content.replace(/`http:\/\/localhost:5000\/api\/creators\/uid\/\$\{cred\.user\.uid\}`/g, "`${import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'}/creators/uid/${cred.user.uid}`");
  fs.writeFileSync(f, content);
});
console.log('Replaced URLs successfully');
