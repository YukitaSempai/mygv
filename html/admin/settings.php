<?php
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$usersFile = getDataPath('users.json');
$message = '';
$error = '';

// Handle password change
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['change_password'])) {
  $current = $_POST['current_password'] ?? '';
  $newPass = $_POST['new_password'] ?? '';
  $confirm = $_POST['confirm_password'] ?? '';
  
  $users = json_decode(file_get_contents($usersFile), true);
  $username = $_SESSION['admin_user'];
  
  if (isset($users[$username]) && password_verify($current, $users[$username]['password_hash'])) {
    if ($newPass === $confirm && strlen($newPass) >= 6) {
      $users[$username]['password_hash'] = password_hash($newPass, PASSWORD_DEFAULT);
      file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
      $message = 'Password updated successfully!';
    } else {
      $error = 'Passwords do not match or too short (min 6 chars).';
    }
  } else {
    $error = 'Current password is incorrect.';
  }
}

// Handle rebuild (trigger build.js)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rebuild_site'])) {
  $buildScript = __DIR__ . '/../../build.js';
  if (file_exists($buildScript)) {
    $output = shell_exec('node ' . escapeshellarg($buildScript) . ' 2>&1');
    $message = 'Site rebuild triggered. Output: ' . htmlspecialchars(substr($output, 0, 500));
  } else {
    $error = 'build.js not found.';
  }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="section-header">
  <h1><i class="fa-solid fa-gear"></i> Settings</h1>
</div>

<?php if ($message): ?>
<div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
<?php endif; ?>
<?php if ($error): ?>
<div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-lock"></i> Change Password
  </div>
  <div class="admin-card-body">
    <form method="post" style="max-width:400px;">
      <div class="form-group">
        <label for="current_password">Current Password</label>
        <input type="password" id="current_password" name="current_password" required>
      </div>
      <div class="form-group">
        <label for="new_password">New Password</label>
        <input type="password" id="new_password" name="new_password" required minlength="6">
      </div>
      <div class="form-group">
        <label for="confirm_password">Confirm New Password</label>
        <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
      </div>
      <button type="submit" name="change_password" class="btn btn-primary">
        <i class="fa-solid fa-floppy-disk"></i> Update Password
      </button>
    </form>
  </div>
</div>

<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-rotate"></i> Site Maintenance
  </div>
  <div class="admin-card-body">
    <p style="color:var(--admin-text-light); font-size:0.88rem;">
      Rebuild the static site after editing sections or content.
    </p>
    <form method="post">
      <button type="submit" name="rebuild_site" class="btn btn-primary" onclick="return confirm('Rebuild the entire site? This may take a moment.');">
        <i class="fa-solid fa-rotate"></i> Rebuild Site
      </button>
    </form>
  </div>
</div>

<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-circle-info"></i> System Info
  </div>
  <div class="admin-card-body">
    <table>
      <tr><td style="font-weight:600;">PHP Version</td><td><?php echo phpversion(); ?></td></tr>
      <tr><td style="font-weight:600;">Server</td><td><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'N/A'; ?></td></tr>
      <tr><td style="font-weight:600;">Document Root</td><td><?php echo $_SERVER['DOCUMENT_ROOT']; ?></td></tr>
      <tr><td style="font-weight:600;">Site Path</td><td><?php echo realpath(__DIR__ . '/../..'); ?></td></tr>
      <tr><td style="font-weight:600;">Admin User</td><td><?php echo htmlspecialchars($_SESSION['admin_user'] ?? ''); ?></td></tr>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
