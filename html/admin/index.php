<?php
session_start();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $users = json_decode(file_get_contents(__DIR__ . '/data/users.json'), true);
  $username = $_POST['username'] ?? '';
  $password = $_POST['password'] ?? '';

  if (isset($users[$username]) && password_verify($password, $users[$username]['password_hash'])) {
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_user'] = $username;
    $_SESSION['admin_name'] = $users[$username]['name'];
    header('Location: dashboard.php');
    exit;
  }
  $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MYGV Admin Login</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body class="login-page">
  <div class="login-box">
    <span class="logo-icon"><i class="fa-solid fa-crown"></i></span>
    <h1>MYGV Admin Panel</h1>
    <?php if ($error): ?>
      <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    <form method="post">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required autofocus autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary btn-block">
        <i class="fa-solid fa-lock"></i> Sign In
      </button>
    </form>
  </div>
</body>
</html>
