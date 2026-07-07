<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$navItems = [
  'dashboard.php' => ['icon' => 'fa-gauge-high', 'label' => 'Dashboard'],
  'edit-i18n.php' => ['icon' => 'fa-language', 'label' => 'Translations'],
  'edit-sections.php' => ['icon' => 'fa-pen-to-square', 'label' => 'Edit Content'],
  'images.php' => ['icon' => 'fa-image', 'label' => 'Images'],
  'settings.php' => ['icon' => 'fa-gear', 'label' => 'Settings'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MYGV Admin - <?php echo $navItems[$currentPage]['label'] ?? 'Panel'; ?></title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body>
  <div class="admin-header">
    <a href="dashboard.php" class="logo">
      <i class="fa-solid fa-crown"></i> MYGV Admin
    </a>
    <div class="header-right">
      <a href="../index.html" target="_blank"><i class="fa-solid fa-up-right-from-square"></i> View Site</a>
      <a href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
    </div>
  </div>
  <div class="admin-layout">
    <nav class="admin-sidebar">
      <?php foreach ($navItems as $file => $item): ?>
        <a href="<?php echo $file; ?>" class="<?php echo $currentPage === $file ? 'active' : ''; ?>">
          <i class="fa-solid <?php echo $item['icon']; ?>"></i>
          <span><?php echo $item['label']; ?></span>
        </a>
      <?php endforeach; ?>
    </nav>
    <div class="admin-content">
