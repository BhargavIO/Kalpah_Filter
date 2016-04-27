   function makeCLAHEImage(id, tileMappings,numHTiles,numVTiles,numBins,TileWidth,TileHeight,ctx,padrows,padcols)
         {
                //Clahe is Image of same class but made all zeros.. 
                
                var Clahe = ctx.createImageData(id.width,id.height)
                 for(var i=0;i<id.width*id.height*4;i+=4)
                 {
                    Clahe.data[i]=0;
                    Clahe.data[i+1]=0;
                    Clahe.data[i+2]=0;
                    Clahe.data[i+3]=255;

                 }
                 
                
                var aLut = new Array(256) ;
                for(var ind=0;ind<256;ind++)
                   {
                    aLut[ind] = ind;
                    aLut[ind] = aLut[ind]/255;
                   }

  
                var imgTileRow=0;
                var mapTileRows= new Array(2);
                var mapTileCols= new Array(2);
                var imgTileNumRows;
                var imgTileNumCols;

                for (var k=0;k<=numVTiles;k++)
            {
                  if (k == 0 ) //special case: top row
                    {
                      imgTileNumRows = TileHeight/2; //always divisible by 2 because of padding
                      mapTileRows[0] =0;
                      mapTileRows[1] =0;
                    } 
                  else 
                    {
                      if (k == numVTiles) //special case: bottom row      
                      {
                        imgTileNumRows = TileHeight/2;
                        mapTileRows[0] = numVTiles-1;
                        mapTileRows[1] = numVTiles-1;
                      }
                      else //%default values
                      {
                        imgTileNumRows = TileHeight; 
                        mapTileRows[0] = k-1; //[upperRow lowerRow]
                        mapTileRows[1] = k;
                      }

                    }
                  
                  
                  // loop over columns of the tileMappings cell array
                  var imgTileCol=0;

                  for (l=0;l<=numHTiles;l++)
               {     
                      if (l == 0 )//%special case: left column
                        {
                          imgTileNumCols = TileWidth/2;
                          mapTileCols[0] = 0;
                          mapTileCols[1] = 0;
                        }
                    else
                      {
                        if (l == numHTiles) // special case: right column
                        {
                          imgTileNumCols = TileWidth/2;
                          mapTileCols[0] = numHTiles-1;
                          mapTileCols[1] = numHTiles-1;
                        }
                      else //default values
                        {
                          imgTileNumCols = TileWidth;
                          mapTileCols[0] = l-1; // right left
                          mapTileCols[1] = l;
                        }
                      }
                    
                    // Extract four tile mappings
                    var ulMapTile = tileMappings[mapTileRows[0]*numHTiles+mapTileCols[0]];
                    var urMapTile = tileMappings[mapTileRows[0]*numHTiles+mapTileCols[1]];
                    var blMapTile = tileMappings[mapTileRows[1]*numHTiles+mapTileCols[0]];
                    var brMapTile = tileMappings[mapTileRows[1]*numHTiles+mapTileCols[1]];

                    // Calculate the new greylevel assignments of pixels 
                    // within a submatrix of the image specified by imgTileIdx. This 
                    // is done by a bilinear interpolation between four different mappings 
                    // in order to eliminate boundary artifacts.
                    
                    var normFactor = imgTileNumRows*imgTileNumCols; //normalization factor  

                    //imgTileIdx = {imgTileRow:imgTileRow+imgTileNumRows-1,imgTileCol:imgTileCol+imgTileNumCols-1};
                      var subImage= ctx.getImageData(imgTileCol,imgTileRow,imgTileNumCols,imgTileNumRows);
                            
                              
                    var imgPixVals = grayxformpixels(subImage, aLut,ctx);
                    
                    var ur=  grayxform(imgPixVals,urMapTile,ctx);
                    var ul=  grayxform(imgPixVals,ulMapTile,ctx);
                    var br=  grayxform(imgPixVals,brMapTile,ctx);
                    var bl=  grayxform(imgPixVals,blMapTile,ctx);
                   
                     
                    // calculate the weights used for linear interpolation between the
                    // four mappings
                    var rowW = new Array(normFactor);
                    var rowRevW = new Array(normFactor);
                    var colW = new Array(normFactor);
                    var colRevW = new Array(normFactor);
                      
                    for(var m=0;m<imgTileNumRows;m++)
                      {
                        for(var n=0;n<imgTileNumCols;n++)
                        {
                           rowW[m*imgTileNumCols+n]=m;
                           rowRevW[m*imgTileNumCols+n]=imgTileNumRows-m;
                         
                        }
                      }

                      for(var m=0;m<imgTileNumRows;m++)
                      {
                        for(var n=0;n<imgTileNumCols;n++)
                        {
                           colW[m*imgTileNumCols+n]=n;
                           colRevW[m*imgTileNumCols+n]=imgTileNumCols-n;
                         
                        }
                      }
                     
                     var clahesubImage = new Array(normFactor);
                           
                    for(var m=0;m<imgTileNumRows;m++)
                      {
                        for(var n=0;n<imgTileNumCols;n++)
                        {
                           var index=m*imgTileNumCols+n;
                       clahesubImage[index]= ((rowRevW[index]*(colRevW[index]*ul[index]+colW[index]*ur[index]) )+ (rowW[index] * (colRevW[index]*bl[index]+colW[index]*br[index]) ) )/normFactor;
                           
                         
                        }
                      }
                    // imgTileIdx = {imgTileRow:imgTileRow+imgTileNumRows-1, ...
                // imgTileCol:imgTileCol+imgTileNumCols-1};
                      
                    for(var m=imgTileRow;m<imgTileRow+imgTileNumRows;m++)
                      {
                        for(var n=imgTileCol;n<imgTileCol+imgTileNumCols;n++)
                        {
                          var index=(m-imgTileRow)*imgTileNumCols+(n-imgTileCol);
                           Clahe.data[m*id.width*4+n*4]=clahesubImage[index];
                           Clahe.data[m*id.width*4+n*4+1]=clahesubImage[index];
                           Clahe.data[m*id.width*4+n*4+2]=clahesubImage[index];
                           Clahe.data[m*id.width*4+n*4+3]=255;
                         
                        }
                      }
                     
                    
                    imgTileCol = imgTileCol + imgTileNumCols;    
            }
                  imgTileRow = imgTileRow + imgTileNumRows;
         } //over tile rows

              
         return Clahe;


         }
           
         function clipHistogram(hist,clipLimit)
            {
              var numBins=256;
              var totalExcess=0;
              for(var ind=0;ind<256;ind++)
                 {
                      if(hist[ind]>clipLimit)
                      totalExcess = totalExcess+hist[ind]-clipLimit;    
                 }

// clip the histogram and redistribute the excess pixels in each bin
             var avgBinIncr = Math.floor(totalExcess/numBins);
             var upperLimit = clipLimit - avgBinIncr; 
             // bins larger than this will be set to clipLimit

// this loop should speed up the operation by putting multiple pixels
// into the "obvious" places first
for (var k=0;k<numBins;k++)
  {
    if (hist[k] > clipLimit)
       hist[k] = clipLimit;
  else
    {
    if ( hist[k] > upperLimit) // high bin count
      {
        totalExcess = totalExcess - (clipLimit - hist[k]);
        hist[k] = clipLimit;
      }
    else
      {
        totalExcess = totalExcess - avgBinIncr;
        hist[k] = hist[k] + avgBinIncr; 
      } 

    }    
   
}
 
// this loops redistributes the remaining pixels, one pixel at a time
var k = 0;
while (totalExcess != 0)
  {   //keep increasing the step as fewer and fewer pixels remain for
      //the redistribution (spread them evenly)
  var stepSize= (Math.floor(numBins/totalExcess)>1) ? Math.floor(numBins/totalExcess):1;
    

  for(var m=k;m<numBins;m=m+stepSize)
    {
      if (hist[m] < clipLimit)
      {
        hist[m] =hist[m]+1;
        totalExcess = totalExcess - 1; //reduce excess
        if (totalExcess == 0)
            break;
      }
    }
  
  
  k = k+1; //prevent from always placing the pixels in bin #1
  if (k >=numBins) // start over if numBins was reached
    k = 0;
  
 }

            }



    Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

    function clip(value)
    {

      if(value>255) 
        return 255;
      else if (value<0)
        return 0;
      else 
         return value;
    }

    function myGray() {        
        var c = document.getElementById("myCanvas");                
        var ctx = c.getContext("2d");                
        var img = document.getElementById("sourceimage");                
        ctx.drawImage(img,0,0,c.width,c.height);                
        var pixels= ctx.getImageData(0,0,c.width,c.height);        
        var data=pixels.data;        
        var pix2= grayscale(pixels);        
        //var pixelsgray=grayscale(pixels);
       // ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
         ctx.putImageData(pix2,0,0,0,0,c.width,c.height);         
}

   


    function mySobel() {
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        var img = document.getElementById("sourceimage");
        ctx.drawImage(img,0,0,c.width,c.height);

        var pixels= ctx.getImageData(0,0,c.width,c.height);
        var data=pixels.data;

        var pix2= pixels;




        //var pixelsgray=grayscale(pixels);
       // ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
         ctx.putImageData(pix2,0,0,0,0,c.width,c.height);

         var vertical = convoluteFloat32(pix2,
         [-1, -2, -1,
         0, 0, 0,
         1, 2, 1], false);
         var vdata=vertical.data;

         var horizontal = convoluteFloat32(pix2,
         [-1, 0, 1,
         -2, 0, 2,
         -1, 0, 1], false);
         var hdata=horizontal.data;


         var id = ctx.createImageData(vertical.width, vertical.height);

         for (var i = 0; i < id.data.length; i += 4)  {
         var v = Math.abs(vertical.data[i]);
         id.data[i] = v;
         var h = Math.abs(horizontal.data[i]);
         id.data[i + 1] = h
         id.data[i + 2] = (v + h) / 4;
         id.data[i + 3] = 255;
         }
        
        // var idgray=grayscale(id);
         ctx.putImageData(id,0,0,0,0,c.width,c.height);



    }
    function myPrewitt() {
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        var img = document.getElementById("sourceimage");
        ctx.drawImage(img,0,0,c.width,c.height);

        var pixels= ctx.getImageData(0,0,c.width,c.height);
        var data=pixels.data;

        var pix2= pixels;




        //var pixelsgray=grayscale(pixels);
        // ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
        ctx.putImageData(pix2,0,0,0,0,c.width,c.height);

        var vertical = convoluteFloat32(pix2,
                [-1, -1, -1,
                    0, 0, 0,
                    1, 1, 1], false);
        var vdata=vertical.data;

        var horizontal = convoluteFloat32(pix2,
                [-1, 0, 1,
                    -1, 0, 1,
                    -1, 0, 1], false);
        var hdata=horizontal.data;


        var id = ctx.createImageData(vertical.width, vertical.height);

        for (var i = 0; i < id.data.length; i += 4)  {
            var v = Math.abs(vertical.data[i]);
            id.data[i] = v;
            var h = Math.abs(horizontal.data[i]);
            id.data[i + 1] = h
            id.data[i + 2] = (v + h) / 4;
            id.data[i + 3] = 255;
        }
        //var idgray=grayscale(id);

        ctx.putImageData(id,0,0,0,0,c.width,c.height);



    }


    function myRoberts() {
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        var img = document.getElementById("sourceimage");
        ctx.drawImage(img,0,0,c.width,c.height);

        var pixels= ctx.getImageData(0,0,c.width,c.height);
        var data=pixels.data;

        var pix2= pixels;




        //var pixelsgray=grayscale(pixels);
        // ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
        ctx.putImageData(pix2,0,0,0,0,c.width,c.height);

        var vertical = convoluteFloat32(pix2,
                    [0, 1,
                    -1,0], false);
        var vdata=vertical.data;

        var horizontal = convoluteFloat32(pix2,
                    [1, 0,
                    0, -1], false);



        var hdata=horizontal.data;


        var id = ctx.createImageData(vertical.width, vertical.height);

        for (var i = 0; i < id.data.length; i += 4)  {
            var v = Math.abs(vertical.data[i]);
            id.data[i] = v;
            var h = Math.abs(horizontal.data[i]);
            id.data[i + 1] = h
            id.data[i + 2] = (v + h) / 4;
            id.data[i + 3] = 255;
        }
        //var idgray=grayscale(id);
        ctx.putImageData(id,0,0,0,0,c.width,c.height);



    }
       
    function myLoG() {
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        var img = document.getElementById("sourceimage");
        ctx.drawImage(img,0,0,c.width,c.height);

        var pixels= ctx.getImageData(0,0,c.width,c.height);
        var data=pixels.data;

        var pix2= pixels;




        //var pixelsgray=grayscale(pixels);
       // ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
         ctx.putImageData(pix2,0,0,0,0,c.width,c.height);
           
           var kernel=gausskernel(3);
            
          

         var gaussian = convoluteFloat32(pix2,
          kernel, false);
         
          var laplacian= convoluteFloat32(gaussian,
          [-1,-1,-1,
          -1,8,-1,
           -1,-1,-1], false);

          var id = ctx.createImageData(laplacian.width, laplacian.height);

         for (var i = 0; i < id.data.length; i += 4)  {
         var h = Math.abs(laplacian.data[i]);

         id.data[i] = h;
          
         id.data[i + 1] = h
         id.data[i + 2] = h;
         id.data[i + 3] = 255;
         }
         //var idgray=grayscale(id);
         ctx.putImageData(id,0,0,0,0,c.width,c.height);
          
          
        
           

    }


    function grayscale(pixels)
    {
        var d = pixels.data;
        for (var i=0; i<d.length; i+=4)
        {
            var r = d[i];
            var g = d[i+1];
            var b = d[i+2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126*r + 0.7152*g + 0.0722*b;
            d[i] = d[i+1] = d[i+2] = v
        }
        return pixels;
    }



    function convoluteFloat32 (pixels, weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);

        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;

        var w = sw;
        var h = sh;
        var output = {
            width: w, height: h, data: new Float32Array(w * h * 4)
        };
        var dst = output.data;

        var alphaFac = opaque ? 1 : 0;

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y * w + x) * 4;
                var r = 0, g = 0, b = 0, a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                        var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                        var srcOff = (scy * sw + scx) * 4;
                        var wt = weights[cy * side + cx];
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                        a += src[srcOff + 3] * wt;
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return output;
    }

    function gausskernel(ksize)
    {
        var output =  new Array(ksize*ksize);
        

           
            
        var horizontal=0;
        var vertical=0;
        var sum=0;
        var count=0;
         sigma=2;
           var limit=(ksize-1)/2;
         for(var y=-limit;y < limit+1 ;y++){
         
         for(var x=-limit;x < limit+1 ;x++){
        
                   var value=Math.exp( (-(x*x)/(2*sigma*sigma)) - (-(y*y)/(2*sigma*sigma)) );
                   output[count]=value;
                   horizontal=horizontal+1;
                   sum=sum+value;
                   count++;

         }
          vertical=vertical+1;
            horizontal=0;
         }

           
         for(var i=0;i<ksize*ksize;i++)
         {   output[i]= output[i]/sum;
          
         }
         
        return output;
    }

function grayxformpixels(pixels,mapping,ctx)
           {
              var sendpixels = new Array(pixels.width*pixels.height);
              var cccc=0;

              for(var i=0;i<pixels.data.length;i+=4)
                 {
                  sendpixels[cccc]= (255*mapping[pixels.data[i]])+0.5;
                   cccc++;
                 }
                  

              return sendpixels;
           }

           function grayxform(pixels,mapping,ctx)
           {
               
              var sendpixels = new Array(pixels.length);
               
              for(var i=0;i<pixels.length;i++)
                 {
                  sendpixels[i]= (255*mapping[Math.floor(pixels[i])])+0.5;
                    
                 }
              return sendpixels;
           }


         function makeMapping(hist,numPixinTile)
         {
            var histsum= new Array(256);
            var mapping= new Array(256);
            histsum[0]=hist[0];
            for(var ind=1;ind<256;ind++)
                histsum[ind]=histsum[ind-1]+hist[ind];

            var valSpread=256; 
            var scale =  valSpread/numPixinTile;
            for(var ind=0;ind<256;ind++)
              { mapping[ind] = Math.min(0 + histsum[ind]*scale ,255);
                mapping[ind]=mapping[ind]/255;
              }

            return mapping;

         }

         function imhist(tile,hist)
         {
            
            
            var offset=0;
            for(var ind=0;ind<256;ind++)
                 hist[ind]=0;
             
            for(var l=0; l<(tile.height);l++)
                 {

               for (var i=offset; i <(tile.width*4)+offset;i+=4) 
                {
                       pixvalue=tile.data[i];
                       hist[pixvalue]=hist[pixvalue]+1;
                }
          offset=offset+((tile.width*4) );
                 }
         
        
           
           
         }


function coloradap(pixels,pix2,pix3){
	var pixelsred=redScale(pixels);
	var pixelsblue=blueScale(pix2);
	var pixelsgreen=greenScale(pix3);
	var idred=myAdapHistEqpixels(pixelsred);
	var idgreen=myAdapHistEqpixels(pixelsgreen);
	var idblue=myAdapHistEqpixels(pixelsblue);
	var idfinalred=getOmnired(idred,idgreen,idblue);
	return idfinalred;
}

function getOmnired(red,green,blue){
	var dred = red.data;
	var dgreen= green.data;
	var dblue= blue.data;
	for (var i=0; i<dred.length; i+=4){
		var r = dblue[i];
		var g = dgreen[i+1];
		var b = dred[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		dred[i] = r;
		dred[i+1] = g;
		dred[i+2] =  b;
	}
	return red;
}

function redScale(pixels){
	var d = pixels.data;
	for (var i=0; i<d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = r;
	}
	return pixels;
}

function greenScale(pixels){
	var d = pixels.data;
	for (var i=0; i<d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = g;
	}
	return pixels;
}

function blueScale(pixels){
	var d = pixels.data;
	for (var i=0; i<d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = b;
	}
	return pixels;
}

function myAdapHistEq() {

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var img = document.getElementById("sourceimage");
	ctx.drawImage(img,0,0,c.width,c.height);

	var pixels= ctx.getImageData(0,0,c.width,c.height);
	var data=pixels.data;
	var pixelsgray=grayscale(pixels);
	pix2=pixelsgray;
	ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
	var width=pixelsgray.width;
	var height=pixelsgray.height;
	ctx.putImageData(pixelsgray,0,0,0,0,width,height);

	var numHTiles = 8;
	var numVTiles = 8;
	// Padding the Original Image
	var padcols=(Math.ceil(width/numHTiles)*numHTiles)-width;
	var padrows=(Math.ceil(height/numVTiles)*numVTiles)-height;

	var index=0;  
	var offset=0;
	var newwidth=width+padcols;
	var newheight=height+padrows;
	var TileWidth= newwidth/numHTiles;
	var TileHeight= newheight/numVTiles;

	if( (newwidth/numHTiles)%2!=0){
		TileWidth=TileWidth+1;
		newwidth=TileWidth*numHTiles;
		padcols=newwidth-width;
	}
	if( (newheight/numVTiles)%2!=0){
		TileHeight=TileHeight+1;
		newheight=TileHeight*numVTiles;
		padrows=newheight-height;
	}   
	var symmetricpadcols1=Math.floor(padcols/2);
	var symmetricpadcols2=padcols-symmetricpadcols1;
	var symmetricpadrows1=Math.floor(padrows/2);
	var symmetricpadrows2=padrows-symmetricpadrows1;
	var newwidth=width+padcols;
	var newheight=height+padrows;

	c.width=newwidth;
	c.height=newheight;

	ctx.putImageData(pixelsgray,0,0,0,0,newwidth,newheight);
	id=ctx.getImageData(0,0,c.width,c.height);
	ctx.putImageData(id,0,0,0,0,newwidth,newheight);

	var numPixinTile= TileWidth*TileHeight;
	var minClipLimit = Math.ceil(numPixinTile/256);
	var clipLimit    = minClipLimit + Math.round(0.01*(numPixinTile-minClipLimit));
	//alert(clipLimit);
	var numTiles = numHTiles*numVTiles;
	var tileMappings = new Array(numTiles) ;

	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			tileMappings[i*numHTiles+j]=new Array(256);
			for(var indices=0;indices<256;indices++)
	    		tileMappings[i*numHTiles+j][indices]=0;
		}
	}
	var tiles = new Array(numTiles);
	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			tiles[i*numHTiles+j]=ctx.getImageData(j*TileWidth,i*TileHeight,TileWidth,TileHeight);
		}
	}

	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			var temphist= new Array(256);
			imhist(tiles[i*numHTiles+j],temphist);
			clipHistogram(temphist,clipLimit); 
			tileMappings[i*numHTiles+j]=makeMapping(temphist,numPixinTile);
		}
	}
	for(var i=0;i<numTiles;i++){
		var max = Math.max.apply(null, tileMappings[i]);
		if(max<1)
			alert("Crossed");
	}
	var numBins=256;
	var AdapImage= makeCLAHEImage(id,tileMappings,numHTiles,numVTiles,numBins,TileWidth,TileHeight,ctx,padrows,padcols)
	c.width=width;
	c.height=height;
	ctx.putImageData(AdapImage,0,0,0,0,width,height);
}

function myomniVueblue() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("sourceimage");
    ctx.drawImage(img,0,0,c.width,c.height);

    var pixels= ctx.getImageData(0,0,c.width,c.height);
    var pix2=   ctx.getImageData(0,0,c.width,c.height);
    var pix3=   ctx.getImageData(0,0,c.width,c.height);
    var data=pixels.data;

    idfinalred=coloradap(pixels,pix2,pix3);

    ctx.putImageData(idfinalred,0,0,0,0,c.width,c.height);
    pixelsnew= ctx.getImageData(0,0,c.width,c.height);
    pix2new=   ctx.getImageData(0,0,c.width,c.height);
    pix3new=   ctx.getImageData(0,0,c.width,c.height);
    data=pixelsnew.data;

    omniRed=coloradap(pixelsnew,pix2new,pix3new);
    ctx.putImageData(omniRed,0,0,0,0,c.width,c.height);
    pixelsnew= ctx.getImageData(0,0,c.width,c.height);
    pix2new=   ctx.getImageData(0,0,c.width,c.height);
    pix3new=   ctx.getImageData(0,0,c.width,c.height);
    data=pixelsnew.data;

    omniRed=coloradap(pixelsnew,pix2new,pix3new);
    ctx.putImageData(omniRed,0,0,0,0,c.width,c.height);
}

function myomniVuered() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("sourceimage");
    ctx.drawImage(img,0,0,c.width,c.height);

    var pixels= ctx.getImageData(0,0,c.width,c.height);
    var pix2=   ctx.getImageData(0,0,c.width,c.height);
    var pix3=   ctx.getImageData(0,0,c.width,c.height);
    var data=pixels.data;

    idfinalred=coloradap(pixels,pix2,pix3);

    ctx.putImageData(idfinalred,0,0,0,0,c.width,c.height);
    pixelsnew= ctx.getImageData(0,0,c.width,c.height);
    pix2new=   ctx.getImageData(0,0,c.width,c.height);
    pix3new=   ctx.getImageData(0,0,c.width,c.height);
    data=pixelsnew.data;

    omniRed=coloradap(pixelsnew,pix2new,pix3new);
    ctx.putImageData(omniRed,0,0,0,0,c.width,c.height);
}

function myAdapHistEqpixels(pixelsgray) {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var img = document.getElementById("sourceimage");
	ctx.drawImage(img,0,0,c.width,c.height);
	var pixels= ctx.getImageData(0,0,c.width,c.height);
	var data=pixels.data;

	pix2=pixelsgray;
	ctx.putImageData(pixelsgray,0,0,0,0,c.width,c.height);
	var width=pixelsgray.width;
	var height=pixelsgray.height;
	ctx.putImageData(pixelsgray,0,0,0,0,width,height);

	var numHTiles = 8;
	var numVTiles = 8;
	//// Padding the Original Image
	var padcols=(Math.ceil(width/numHTiles)*numHTiles)-width;
	var padrows=(Math.ceil(height/numVTiles)*numVTiles)-height;
	var index=0;  
	var offset=0;
	var newwidth=width+padcols;
	var newheight=height+padrows;
	var TileWidth= newwidth/numHTiles;
	var TileHeight= newheight/numVTiles;

	if( (newwidth/numHTiles)%2!=0){
		TileWidth=TileWidth+1;
		newwidth=TileWidth*numHTiles;
		padcols=newwidth-width;
	}
	if( (newheight/numVTiles)%2!=0){
		TileHeight=TileHeight+1;
		newheight=TileHeight*numVTiles;
		padrows=newheight-height;
	}   
	var symmetricpadcols1=Math.floor(padcols/2);
	var symmetricpadcols2=padcols-symmetricpadcols1;
	var symmetricpadrows1=Math.floor(padrows/2);
	var symmetricpadrows2=padrows-symmetricpadrows1;
	var newwidth=width+padcols;
	var newheight=height+padrows;
	c.width=newwidth;
	c.height=newheight;

	ctx.putImageData(pixelsgray,0,0,0,0,newwidth,newheight);
	id=ctx.getImageData(0,0,c.width,c.height);
	ctx.putImageData(id,0,0,0,0,newwidth,newheight);

	var numPixinTile= TileWidth*TileHeight;
	var minClipLimit = Math.ceil(numPixinTile/256);
	var clipLimit    = minClipLimit + Math.round(0.01*(numPixinTile-minClipLimit));

	//alert(clipLimit);
	var numTiles = numHTiles*numVTiles;
	var tileMappings = new Array(numTiles) ;
	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			tileMappings[i*numHTiles+j]=new Array(256);
			for(var indices=0;indices<256;indices++)
				tileMappings[i*numHTiles+j][indices]=0;
		}
	}

	var tiles = new Array(numTiles);

	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			tiles[i*numHTiles+j]=ctx.getImageData(j*TileWidth,i*TileHeight,TileWidth,TileHeight);
		}
	}

	for(var i=0;i<numVTiles;i++){
		for(var j=0;j<numHTiles;j++){
			var temphist= new Array(256);
			imhist(tiles[i*numHTiles+j],temphist);
			clipHistogram(temphist,clipLimit); 
			tileMappings[i*numHTiles+j]=makeMapping(temphist,numPixinTile);
		}
	}

	for(var i=0;i<numTiles;i++){
		var max = Math.max.apply(null, tileMappings[i]);
		if(max<1)
			alert("Crossed");
	}
	var numBins=256;
	var AdapImage= makeCLAHEImage(id,tileMappings,numHTiles,numVTiles,numBins,TileWidth,TileHeight,ctx,padrows,padcols)
	c.width=width;
	c.height=height;
	//ctx.putImageData(AdapImage,0,0,0,0,width,height);
	return AdapImage;
}



