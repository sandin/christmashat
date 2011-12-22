<?php

function render_to_response($template, $params = null) {
    require_once 'h2o/h2o.php';
    $views = new h2o($template);
    return $views->render($params);
}
