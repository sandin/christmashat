<?php
defined('DS') ||
    define('DS', DIRECTORY_SEPARATOR);
defined('APPLICATION_ROOT') ||
    define('APPLICATION_ROOT', dirname(__FILE__));
defined('PUBLIC_URL') ||
    define('PUBLIC_URL', '/~lds/merry/'); # htdocs root
defined('UPLOAD_DIR') ||
    define('UPLOAD_DIR', 'uploads');
set_include_path(get_include_path() . PATH_SEPARATOR 
    . realpath(APPLICATION_ROOT . '/libs')
);
//var_dump(get_include_path());

require_once 'libs/functions.php';

$step = isset($_GET['step']) ? $_GET['step'] : 1;

if ($step == 1) { // upload
    echo upload_view();
} elseif ($step == 2) {
    echo index_view($_REQUEST);
} else {
    echo '404 not found';
}

function upload_view($request = null) {
    return render_to_response('templates/upload.html');
}

function index_view($request = null) {
    if (!isset($_FILES['photo'])) {
        return render_to_response('templates/upload.html');
    }
    $ALLOW_MIME = array('image/png', 'image/jpeg', 'image/gif');
    $uploaddir = APPLICATION_ROOT . DS . UPLOAD_DIR;
    $fileTo = md5(basename($_FILES['photo']['name'])) . '.jpg';
    $uploadfile = $uploaddir . DS . $fileTo;
    $tmpFile = $_FILES['photo']['tmp_name'];
    # check image mime
    $mime = 'NOT_A_IMAGE';
    $info = getimagesize($tmpFile);
    $width = $info[0];
    $height = $info[1];
    if ($info !== false && $width > 0 && $height >0) {
        $mime = $info['mime'];
    }
    if (!in_array($mime, $ALLOW_MIME)) {
        return render_to_response('templates/upload.html', array('message'=>'image(jpg,gif,png) only'));
    }
    # the file is ok, save it
    if (move_uploaded_file($tmpFile, $uploadfile)) {
        $filename = PUBLIC_URL . UPLOAD_DIR . '/' . $fileTo;
        return render_to_response('templates/index.html', array(
            'filename'=>$filename, 'image_width'=>$width, 
            'image_height'=>$height));
    } else {
        die("Possible file upload attack!\n");
    }
}

