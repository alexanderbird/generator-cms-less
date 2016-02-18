<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On'); // or ini_set('display_errors', 1);

$requestedPageName = 'index';
if(isset($_GET['p'])) {
  $requestedPageName = $_GET['p'];
  $requestedPageName = $requestedPageName == '' ? 'index' : $requestedPageName;
}

if(file_exists("./$requestedPageName.html")) {
  $pageName = $requestedPageName;
} else {
  $pageName = '404';
}

/*************************/
/*  Prepare the content  */
/*************************/
$contents = file_get_contents("./$pageName.html");
$contentsNodes = new DOMDocument();
$contentsNodes->loadHTML($contents);

// the default 404 page uses JavaScript to set the name of the page that's missing
//  doing the same thing here
foreach($contentsNodes->getElementsByTagName('span') as $span) {
  if($span->getAttribute('class') == 'page-name') {
    $span->appendChild($contentsNodes->createTextNode($requestedPageName));
  }
}

/*************************/
/*  Load the outer page  */
/*************************/
$index = file_get_contents("../index.html");
$completePage = new DOMDocument();
$completePage->loadHTML($index);

/*************************/
/*         Merge         */
/*************************/
// find the destination
$destination = $completePage->getElementById('cms-less-destination');

// empty the destination
foreach($destination->childNodes as $node) {
  $destination->removeChild($node);
}

// load the page content
foreach($contentsNodes->getElementsByTagName('body')->item(0)->childNodes as $node) {
  $importedNode = $completePage->importNode($node, true);
  if($importedNode) {
    $destination->appendChild($importedNode);
  }
}

/*************************/
/* Process the full page */
/*************************/
// remove the script tags
$scriptElements = $completePage->getElementsByTagName('script');
for ($i = $scriptElements->length; --$i >= 0; ) {
  $script = $scriptElements->item($i);
  $script->parentNode->removeChild($script);
}

/**************************/
/*         Return         */
/**************************/
echo $completePage->saveHTML();

?>
