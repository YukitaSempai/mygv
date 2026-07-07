<?php
function requireLogin() {
  session_start();
  if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
  }
}

function getDataPath($file) {
  return __DIR__ . '/../data/' . $file;
}

function getPageList() {
  $pages = [
    'index' => 'Home',
    'about' => 'About',
    'contact' => 'Contact',
    'corporate' => 'Corporate',
    'brochure-personalized' => 'GV Brochure',
    'tournament' => 'Tournament',
    'gvnb' => 'GVNB',
    'gvns' => 'GVNS',
    'packages' => 'Packages',
    'course-map' => 'Course Map',
    'buy' => 'Buy',
    'etransfer' => 'E-Transfer',
    'terms-2026' => 'Terms',
    'faq' => 'FAQ',
    'privacy' => 'Privacy',
    'accessibility' => 'Accessibility',
    'careers' => 'Careers',
    'press' => 'Press',
    'registro' => 'Registration',
    'mission-statement' => 'Mission Statement'
  ];
  return $pages;
}

function getImageList() {
  $imgDir = __DIR__ . '/../../img';
  $images = [];
  if (is_dir($imgDir)) {
    $files = scandir($imgDir);
    foreach ($files as $f) {
      if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $f)) {
        $path = $imgDir . '/' . $f;
        $images[] = [
          'name' => $f,
          'path' => 'img/' . $f,
          'size' => filesize($path),
          'modified' => filemtime($path)
        ];
      }
    }
  }
  usort($images, function($a, $b) {
    return $b['modified'] - $a['modified'];
  });
  return $images;
}

function formatBytes($bytes, $precision = 1) {
  $units = ['B', 'KB', 'MB', 'GB'];
  $bytes = max($bytes, 0);
  $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
  $pow = min($pow, count($units) - 1);
  return round($bytes / pow(1024, $pow), $precision) . ' ' . $units[$pow];
}
