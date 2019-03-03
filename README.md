# csgo-sharecode-decoder

sharecode decoder from https://github.com/joshuaferrara/node-csgo ported to work in the browser without the need for babel or ES6.

## Usage

```html
<script type="text/javascript" src="./pack.js"></script>
<script type="text/javascript" src="./bignumber.min.js"></script>
<script type="text/javascript" src="./sharecode.js"></script>

<script>
var decoder = new SharecodeDecoder('CSGO-*****-*****-*****-*****-*****');

console.log(decoder.decode());
</srcipt>
```
