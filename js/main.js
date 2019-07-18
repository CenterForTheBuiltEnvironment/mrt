var container;
var camera, scene, renderer, raycaster, projector, INTERSECTED, directionalLight;
var surfaces = [];
var mouse = new THREE.Vector2();

mrt.occupant = {
    'position': {'x': 1, 'y': 1},
    'azimuth': 0.0,
    'posture': 'seated',
};

mrt.room = {
    'depth': 5.0,
    'width': 10.0,
    'height': 2.6,
}

params = {
    'azimuth': 0,
    'opacity': 0,
    'wall1': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': true,
        'tsol': 0.8,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 8.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall2': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': false,
        'tsol': 0.8,
        'temperature': 36.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall3': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': false,
        'tsol': 0.8,
        'temperature': 38.0,
        'emissivity': 0.9,
        'width': 8.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall4': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': false,
        'tsol': 0.8,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'ceiling': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': false,
        'tsol': 0.8,
        'temperature': 50.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 3.0,
        'xposition': 1.0,
        'yposition': 1.0,
      },
    },
    'floor': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'window': false,
        'tsol': 0.8,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 3.0,
        'xposition': 1.0,
        'yposition': 1.0,
      },
    },
    'display': 'MRT',
    'autoscale': true,
    'scaleMin': 20.0,
    'scaleMax': 40.0,
    'setGlobalSurfaceTemp': 21,    
    'update': function(){
      document.getElementById('calculating').style.display = "";
      setTimeout(function() {
        calculate_all(true);
      }, 0);
    }
};

var view_factors;
var panelBorderMin = 0.1 // minimum distance from panel edge to surface edge
var tempMax = 300; // highest temperature you can enter in the model
var tempMin = -30; // lowest temperature you can enter in the model

function set_wall_properties(){
  mrt.walls = [
      {
          'name': 'wall1',
          'temperature': params.wall1.temperature,
          'emissivity': params.wall1.emissivity,
          'plane': 'xz', // 'xy' plane for webgl geometry
          'u': mrt.room.width,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall2',
          'temperature': params.wall2.temperature,
          'emissivity': params.wall2.emissivity,
          'plane': 'yz',
          'u': mrt.room.depth,
          'v': mrt.room.height,
          'offset': {'x': mrt.room.width, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall3',
          'temperature': params.wall3.temperature,
          'emissivity': params.wall3.emissivity,
          'plane': 'xz',
          'u': mrt.room.width,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': mrt.room.depth, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall4',
          'temperature': params.wall4.temperature,
          'emissivity': params.wall4.emissivity,
          'plane': 'yz',
          'u': mrt.room.depth,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'ceiling',
          'temperature': params.ceiling.temperature,
          'emissivity': params.ceiling.emissivity,
          'plane': 'xy',
          'u': mrt.room.width,
          'v': mrt.room.depth,
          'offset': {'x': 0, 'y': 0, 'z': mrt.room.height},
          'subsurfaces': [],
      },
      {
          'name': 'floor',
          'temperature': params.floor.temperature,
          'emissivity': params.floor.emissivity,
          'plane': 'xy',
          'u': mrt.room.width,
          'v': mrt.room.depth,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      }
  ];

  var wall1 = _.find(mrt.walls, function(w){ return w.name === 'wall1' });
  if (params.wall1.panel.active){
    wall1.subsurfaces = [
        {
          'name': 'wall1panel1',
          'temperature': params.wall1.panel.temperature,
          'emissivity': params.wall1.panel.emissivity,
          'u': params.wall1.panel.xposition,
          'v': params.wall1.panel.yposition,
          'width': params.wall1.panel.width,
          'height': params.wall1.panel.height,
      }
    ];
  }

  var wall2 = _.find(mrt.walls, function(w){ return w.name === 'wall2' });
  if (params.wall2.panel.active){
    wall2.subsurfaces = [
        {
          'name': 'wall2panel1',
          'temperature': params.wall2.panel.temperature,
          'emissivity': params.wall2.panel.emissivity,
          'u': params.wall2.panel.xposition,
          'v': params.wall2.panel.yposition,
          'width': params.wall2.panel.width,
          'height': params.wall2.panel.height,
      }
    ];
  }

  var wall3 = _.find(mrt.walls, function(w){ return w.name === 'wall3' });
  if (params.wall3.panel.active){
    wall3.subsurfaces = [
        {
          'name': 'wall3panel1',
          'temperature': params.wall3.panel.temperature,
          'emissivity': params.wall3.panel.emissivity,
          'u': params.wall3.panel.xposition,
          'v': params.wall3.panel.yposition,
          'width': params.wall3.panel.width,
          'height': params.wall3.panel.height,
      }
    ];
  }

  var wall4 = _.find(mrt.walls, function(w){ return w.name === 'wall4' });
  if (params.wall4.panel.active){
    wall4.subsurfaces = [
        {
          'name': 'wall4panel1',
          'temperature': params.wall4.panel.temperature,
          'emissivity': params.wall4.panel.emissivity,
          'u': params.wall4.panel.xposition,
          'v': params.wall4.panel.yposition,
          'width': params.wall4.panel.width,
          'height': params.wall4.panel.height,
      }
    ];
  }

  var ceiling = _.find(mrt.walls, function(w){ return w.name === 'ceiling' });
  if (params.ceiling.panel.active){
    ceiling.subsurfaces = [
        {
          'name': 'ceilingpanel1',
          'temperature': params.ceiling.panel.temperature,
          'emissivity': params.ceiling.panel.emissivity,
          'u': params.ceiling.panel.xposition,
          'v': params.ceiling.panel.yposition,
          'width': params.ceiling.panel.width,
          'height': params.ceiling.panel.height,
      }
    ];
  }

  var floor = _.find(mrt.walls, function(w){ return w.name === 'floor' });
  if (params.floor.panel.active){
    floor.subsurfaces = [
        {
          'name': 'floorpanel1',
          'temperature': params.floor.panel.temperature,
          'emissivity': params.floor.panel.emissivity,
          'u': params.floor.panel.xposition,
          'v': params.floor.panel.yposition,
          'width': params.floor.panel.width,
          'height': params.floor.panel.height,
      }
    ];
  }

};

function gen_zone_geometry(){

    var wall1 = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': 0}
        ],
        'name': 'wall1'
    };
    if (params.wall1.panel.active){
      var u0 = params.wall1.panel.xposition;
      var v0 = params.wall1.panel.yposition;
      var w = Math.min(params.wall1.panel.width, mrt.room.width - (u0 + panelBorderMin));
      var h = Math.min(params.wall1.panel.height, mrt.room.height - (v0 + panelBorderMin));
      wall1.children = [
        { 'vertices': [{'x': u0, 'y': v0, 'z': 0 },
                       {'x': u0, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0, 'z': 0 }],
          'radiant_t': params.wall1.panel.temperature,
          'emissivity': params.wall1.panel.emissivity,
          'name': 'wall1panel1'
        },
      ];
    } else {
      wall1.children = [];
    }

    var wall2 = {
        'vertices': [
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth}
        ],
        'name': 'wall2'
    };
    if (params.wall2.panel.active){
      var u0 = params.wall2.panel.xposition;
      var v0 = params.wall2.panel.yposition;
      var w = Math.min(params.wall2.panel.width, mrt.room.depth - (u0 + panelBorderMin));
      var h = Math.min(params.wall2.panel.height, mrt.room.height - (v0 + panelBorderMin));
      wall2.children = [
        { 'vertices': [{'x': mrt.room.width, 'y': v0, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 + w },
                       {'x': mrt.room.width, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall2.panel.temperature,
          'emissivity': params.wall2.panel.emissivity,
          'name': 'wall2panel1'
        },
      ];
    } else {
      wall2.children = [];
    }

    var wall3 = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}
        ],
        'name': 'wall3'
    };

    if (params.wall3.panel.active){
      var u0 = params.wall3.panel.xposition;
      var v0 = params.wall3.panel.yposition;
      var w = Math.min(params.wall3.panel.width, mrt.room.width - (u0 + panelBorderMin));
      var h = Math.min(params.wall3.panel.height, mrt.room.height - (v0 + panelBorderMin));
      wall3.children = [
        { 'vertices': [{'x': u0, 'y': v0, 'z': mrt.room.depth },
                       {'x': u0, 'y': v0 + h, 'z': mrt.room.depth },
                       {'x': u0 + w, 'y': v0 + h, 'z': mrt.room.depth },
                       {'x': u0 + w, 'y': v0, 'z': mrt.room.depth }],
          'radiant_t': params.wall3.panel.temperature,
          'emissivity': params.wall3.panel.emissivity,
          'name': 'wall3panel1',
        },
      ];
    } else {
      wall3.children = [];
    }

    var wall4 = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': 0, 'z': mrt.room.depth}
        ],
        'name': 'wall4'
    };

    if (params.wall4.panel.active){
      var u0 = params.wall4.panel.xposition;
      var v0 = params.wall4.panel.yposition;
      var w = Math.min(params.wall4.panel.width, mrt.room.depth - (u0 + panelBorderMin));
      var h = Math.min(params.wall4.panel.height, mrt.room.height - (v0 + panelBorderMin));
      wall4.children = [
        { 'vertices': [{'x': 0, 'y': v0, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 + w },
                       {'x': 0, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall4.panel.temperature,
          'emissivity': params.wall4.panel.emissivity,
          'name': 'wall4panel1',
        },
      ];
    } else {
      wall4.children = [];
    }

    var ceiling = {
        'vertices': [
          {'x': 0, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}
        ],
        'name': 'ceiling'
    };

    if (params.ceiling.panel.active){
      var u0 = params.ceiling.panel.xposition;
      var v0 = params.ceiling.panel.yposition;
      var w = Math.min(params.ceiling.panel.width, mrt.room.width - (u0 + panelBorderMin));
      var h = Math.min(params.ceiling.panel.height, mrt.room.depth - (v0 + panelBorderMin));
      ceiling.children = [
        { 'vertices': [{'x': u0, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 + h },
                       {'x': u0, 'y': mrt.room.height, 'z': v0 + h }],
          'radiant_t': params.ceiling.panel.temperature,
          'emissivity': params.ceiling.panel.emissivity,
          'name': 'ceilingpanel1',
        },
      ];
    } else {
      ceiling.children = [];
    }

    var floor = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
          {'x': 0, 'y': 0, 'z': mrt.room.depth}
        ],
       'name': 'floor'
    };

    if (params.floor.panel.active){
      var u0 = params.floor.panel.xposition;
      var v0 = params.floor.panel.yposition;
      var w = Math.min(params.floor.panel.width, mrt.room.width - (u0 + panelBorderMin));
      var h = Math.min(params.floor.panel.height, mrt.room.depth - (v0 + panelBorderMin));
      floor.children = [
        { 'vertices': [{'x': u0, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 + h },
                       {'x': u0, 'y': 0, 'z': v0 + h }],
          'radiant_t': params.floor.panel.temperature,
          'emissivity': params.floor.panel.emissivity,
          'name': 'floorpanel1',
        },
      ];
    } else {
      floor.children = [];
    }

    var myZone = [ wall1, wall2, wall3, wall4, ceiling, floor ];
    return myZone;
}

function wallPanelGeometry(vertices){
  var Nv = vertices.length;
  var geometry = new THREE.Geometry();
  for (var j = 0; j < Nv; j++){
    geometry.vertices.push(new THREE.Vector3( vertices[j].x, vertices[j].y, vertices[j].z ))
  }
  for (var j = 0; j < Nv - 2; j++){
    var face = new THREE.Face3( 0, j+1, j+2 )
    geometry.faces.push(face);
  }
  return geometry;
}

function wallPanelMesh(geometry){
  var material = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      reflectivity: 100,
      transparent: true,
      opacity: 1.0
  } );
  material.side = THREE.DoubleSide;
  var uva = new THREE.Vector2(0,0);
  var uvb = new THREE.Vector2(0,1);
  var uvc = new THREE.Vector2(1,1);
  var uvd = new THREE.Vector2(1,0);

  geometry.faceVertexUvs[0].push([uva, uvb, uvc])
  geometry.faceVertexUvs[0].push([uva.clone(), uvc, uvd.clone()])
  geometry.computeFaceNormals();

  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function remove_zone() {
  var objsToRemove = _.rest(scene.children, 3);
  _.each(objsToRemove, function( object ) {
      scene.remove(object);
  });
}

function render_zone(){

  // Grid

  var step = 1;
  var geometry = new THREE.Geometry();
  for ( var i = 0; i <= mrt.room.depth; i += step ) {
    geometry.vertices.push( new THREE.Vector3( 0, 0, i ) );
    geometry.vertices.push( new THREE.Vector3( mrt.room.width, 0, i ) );
  }
  for ( var i = 0; i <= mrt.room.width; i += step ) {
    geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( i, 0, mrt.room.depth) );
  }

  var material = new THREE.LineBasicMaterial( { color: 0xaaaaaa, opacity: 0.2 } );
  var line = new THREE.Line( geometry, material );
  line.type = THREE.LinePieces;
  scene.add( line );

  var z = gen_zone_geometry();

  // plane has the same dimensions as the floor
  var margin = {
    'x': mrt.room.width / 20,
    'y': mrt.room.depth / 20,
  }
  var aspect_ratio = mrt.room.width / mrt.room.depth;
  var Nx = Math.floor(26.0 * aspect_ratio);
  var Ny = Math.floor(26.0 / aspect_ratio);
  var plane_geometry = new THREE.PlaneGeometry( mrt.room.width - margin.x, mrt.room.depth - margin.y, Nx, Ny );

  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors,
  });

  plane = new THREE.Mesh( plane_geometry, material );
  plane.rotation.x = Math.PI / 2;
  plane.position.x = mrt.room.width / 2;
  plane.position.y = (mrt.occupant.posture == 'seated') ? 0.6 : 1.1;
  plane.position.z = mrt.room.depth / 2;
  plane.geometry.dynamic = true; // so that we can change the vertex colors
  plane.name = "visualization";
  scene.add( plane );
  plane.updateMatrixWorld();

  // Surfaces

  var Np = z.length;
  var thetax, thetaz
  for (var i = 0; i < Np; i++){
    var p = z[i];
    var wall = wallPanelGeometry(p.vertices);

    if (p.children.length > 0){

      wall.computeFaceNormals();
      var n0 = wall.faces[0].normal;

      var arg = Math.pow(n0.x, 2) + Math.pow(n0.z, 2)
      if (arg == 0){
        thetay = 0;
      } else {
        thetay = Math.acos( n0.z / arg );
      }

      arg = Math.pow(n0.y, 2) + Math.pow(n0.z, 2)
      if (arg == 0){
        thetax = 0;
      } else {
        thetax = Math.acos( n0.z / arg );
      }

      var t = new THREE.Matrix4();
      var u = new THREE.Matrix4();
      var ti = new THREE.Matrix4();
      t.makeRotationX( thetax );
      u.makeRotationY( thetay );
      t.multiply( u );
      ti.getInverse( t );

      // height translation to be applied later
      var h = new THREE.Matrix4();
      h.makeTranslation(wall.vertices[0].x, wall.vertices[0].y, wall.vertices[0].z);

      wall.applyMatrix( t );
      var wallShape = new THREE.Shape();
      wallShape.moveTo( wall.vertices[0].x, wall.vertices[0].y );

      for (var j = 1; j < wall.vertices.length; j++){
        var v = wall.vertices[j];
        wallShape.lineTo( v.x, v.y );
      }

      for (var k = 0; k < p.children.length; k++){
        var panel = wallPanelGeometry(p.children[k].vertices);
        panel.applyMatrix( t );
        var hole = new THREE.Path();
        hole.moveTo(panel.vertices[0].x, panel.vertices[0].y);
        for (var kk = (panel.vertices.length - 1); kk > 0; kk--){
          hole.lineTo(panel.vertices[kk].x, panel.vertices[kk].y);
        }
        wallShape.holes.push(hole);

        panel.applyMatrix( ti );
        var mesh = wallPanelMesh(panel);
        mesh.name = p.children[k].name;
        scene.add(mesh);
        surfaces.push(mesh);

      }
      wall = new THREE.ShapeGeometry(wallShape);
      wall.applyMatrix( ti );
      wall.applyMatrix( h );
    }

    // wall texture
    //var wall_texture = THREE.ImageUtils.loadTexture( 'img/wall1.jpg' );
    var material = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        //map: wall_texture,
        //bumpMap: wall_texture,
        reflectivity: 100,
        transparent: true,
        opacity: 1.0,
    } );

    material.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(wall, material);

    var uva = new THREE.Vector2(0,0);
    var uvb = new THREE.Vector2(0,1);
    var uvc = new THREE.Vector2(1,1);
    var uvd = new THREE.Vector2(1,0);

    mesh.geometry.faceVertexUvs[0].push([uva, uvb, uvc])
    mesh.geometry.faceVertexUvs[0].push([uva.clone(), uvc, uvd.clone()])

    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();

    mesh.name = p.name;
    scene.add(mesh);
    surfaces.push(mesh);

    setOpacity(params.opacity);

    // edges
    var egh = new THREE.EdgesHelper(mesh, 0x444444);
    egh.material.linewidth = 2;
    scene.add(egh);

  }
}

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 3000, - 500, 1000 );
  camera.position.x = -6.0;
  camera.position.y = 17.0;
  camera.position.z = -6.0;
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  projector = new THREE.Projector();

  var dir = new THREE.Vector3( 1, 0, 0 );
  var origin = new THREE.Vector3( 1, 0, -4.5 );
  var length = 3;
  var hex = 0x000000;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.3, 0.3);
  scene.add( arrowHelper );

  var textGeo = new THREE.TextGeometry("N", {
      "size": 1,
      "height": 0.1
  });
  var textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  var textMesh = new THREE.Mesh(textGeo, textMaterial);
  textMesh.position = new THREE.Vector3( 0, 0, -5);
  textMesh.rotation.x = -Math.PI / 2;
  textMesh.rotation.z = -Math.PI / 2;
  scene.add( textMesh );

  var sunGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );
  var sunMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000, opacity: 0.8, emissive: 0xffff00} );
  sun = new THREE.Mesh( sunGeometry, sunMaterial );
  scene.add( sun );

  // Gui
  var gui = new dat.GUI();

  var f_room = gui.addFolder('Room')
  f_room.add(mrt.room, 'width').min(2).max(100).step(1)
    .onFinishChange(function(){
      view_factors_need_updating = true;
      set_panel_guis();
      calculate_all();
    });
  f_room.add(mrt.room, 'depth').min(2).max(100).step(1)
    .onFinishChange(function(){
      view_factors_need_updating = true;
      set_panel_guis();
      calculate_all();
    })
  f_room.add(mrt.room, 'height').min(2).max(16).step(0.1)
    .onFinishChange(function(){
      view_factors_need_updating = true;
      set_panel_guis();
      calculate_all();
    });

  function set_surface_property(surface_name, property, value, panel){
    var surface = _.find(mrt.walls, function(r){ return r.name == surface_name; });
    if (panel){
      surface.subsurfaces[0][property] = value;
    } else {
      surface[property] = value;
    }
    update_shortwave_components();
    update_visualization();
  }

  // Surfaces
  var f_surfaces = gui.addFolder('Surfaces');

  // Wall 1 gui /////////////////////

  var f_wall1 = f_surfaces.addFolder('Wall 1');
  f_wall1.add(params.wall1, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.temperature, false) });
  f_wall1.add(params.wall1, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.emissivity, false) });

  var panel_wall1 = f_wall1.addFolder('Panel');
  panel_wall1.add(params.wall1.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
    });
  panel_wall1.add(params.wall1.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall1.add(params.wall1.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall1.add(params.wall1.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.panel.temperature, true) });
  panel_wall1.add(params.wall1.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.panel.emissivity, true) });

  var panel_wall1_width = panel_wall1.add(params.wall1.panel, 'width').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_wall1_height = panel_wall1.add(params.wall1.panel, 'height').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  var panel_wall1_xpos = panel_wall1.add(params.wall1.panel, 'xposition').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_wall1_ypos = panel_wall1.add(params.wall1.panel, 'yposition').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  _.each([panel_wall1_width, panel_wall1_height, panel_wall1_xpos, panel_wall1_ypos], function(g){
    g.onFinishChange(function(){
      if (params.wall1.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Wall 2 gui /////////////////////

  var f_wall2 = f_surfaces.addFolder('Wall 2');
  f_wall2.add(params.wall2, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.temperature, false) });
  f_wall2.add(params.wall2, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.emissivity, false) });

  var panel_wall2 = f_wall2.addFolder('Panel');
  panel_wall2.add(params.wall2.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
    });
  panel_wall2.add(params.wall2.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall2.add(params.wall2.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall2.add(params.wall2.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.panel.temperature, true) });
  panel_wall2.add(params.wall2.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.panel.emissivity, true) });

  var panel_wall2_width = panel_wall2.add(params.wall2.panel, 'width').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_wall2_height = panel_wall2.add(params.wall2.panel, 'height').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  var panel_wall2_xpos = panel_wall2.add(params.wall2.panel, 'xposition').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_wall2_ypos = panel_wall2.add(params.wall2.panel, 'yposition').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  _.each([panel_wall2_width, panel_wall2_height, panel_wall2_xpos, panel_wall2_ypos], function(g){
    g.onFinishChange(function(){
      if (params.wall2.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Wall 3 gui /////////////////////

  var f_wall3 = f_surfaces.addFolder('Wall 3');
  f_wall3.add(params.wall3, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){
      set_surface_property('wall3', 'temperature', params.wall3.temperature, false)
  });
  f_wall3.add(params.wall3, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){
      set_surface_property('wall3', 'emissivity', params.wall3.emissivity, false)
  });

  var panel_wall3 = f_wall3.addFolder('Panel');
  panel_wall3.add(params.wall3.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
  });
  panel_wall3.add(params.wall3.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall3.add(params.wall3.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall3.add(params.wall3.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){
      set_surface_property('wall3', 'temperature', params.wall3.panel.temperature, true)
  });
  panel_wall3.add(params.wall3.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){
      set_surface_property('wall3', 'emissivity', params.wall3.panel.emissivity, true)
  });

  var panel_wall3_width = panel_wall3.add(params.wall3.panel, 'width').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_wall3_height = panel_wall3.add(params.wall3.panel, 'height').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  var panel_wall3_xpos = panel_wall3.add(params.wall3.panel, 'xposition').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_wall3_ypos = panel_wall3.add(params.wall3.panel, 'yposition').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  _.each([panel_wall3_width, panel_wall3_height, panel_wall3_xpos, panel_wall3_ypos], function(g){
    g.onFinishChange(function(){
      if (params.wall3.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Wall 4 gui /////////////////////

  var f_wall4 = f_surfaces.addFolder('Wall 4');
  f_wall4.add(params.wall4, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.temperature, false) });
  f_wall4.add(params.wall4, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.emissivity, false) });

  var panel_wall4 = f_wall4.addFolder('Panel');
  panel_wall4.add(params.wall4.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
  });
  panel_wall4.add(params.wall4.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall4.add(params.wall4.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_wall4.add(params.wall4.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.panel.temperature, true) });
  panel_wall4.add(params.wall4.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.panel.emissivity, true) });

  var panel_wall4_width = panel_wall4.add(params.wall4.panel, 'width').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_wall4_height = panel_wall4.add(params.wall4.panel, 'height').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  var panel_wall4_xpos = panel_wall4.add(params.wall4.panel, 'xposition').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_wall4_ypos = panel_wall4.add(params.wall4.panel, 'yposition').min(0.1).max(mrt.room.height - 2 * panelBorderMin).step(0.01)
  _.each([panel_wall4_width, panel_wall4_height, panel_wall4_xpos, panel_wall4_ypos], function(g){
    g.onFinishChange(function(){
      if (params.wall4.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Ceiling gui /////////////////////

  var f_ceiling = f_surfaces.addFolder('Ceiling')
  f_ceiling.add(params.ceiling, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.temperature, false) });
  f_ceiling.add(params.ceiling, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.emissivity, false) });

  var panel_ceiling = f_ceiling.addFolder('Panel');
  panel_ceiling.add(params.ceiling.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
  });
  panel_ceiling.add(params.ceiling.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_ceiling.add(params.ceiling.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_ceiling.add(params.ceiling.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.panel.temperature, true) });
  panel_ceiling.add(params.ceiling.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.panel.emissivity, true) });

  var panel_ceiling_width = panel_ceiling.add(params.ceiling.panel, 'width').min(0.1).max(mrt.room.width - 2*panelBorderMin).step(0.01)
  var panel_ceiling_height = panel_ceiling.add(params.ceiling.panel, 'height').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_ceiling_xpos = panel_ceiling.add(params.ceiling.panel, 'xposition').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_ceiling_ypos = panel_ceiling.add(params.ceiling.panel, 'yposition').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
    _.each([panel_ceiling_width, panel_ceiling_height, panel_ceiling_xpos, panel_ceiling_ypos], function(g){
    g.onFinishChange(function(){
      if (params.ceiling.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Floor gui /////////////////////

  var f_floor = f_surfaces.addFolder('Floor');
  f_floor.add(params.floor, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.temperature, false) });
  f_floor.add(params.floor, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.emissivity, false) });

  var panel_floor = f_floor.addFolder('Panel');
  panel_floor.add(params.floor.panel, 'active')
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
  });
  panel_floor.add(params.floor.panel, 'window')
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_floor.add(params.floor.panel, 'tsol').min(0).max(1).step(0.001)
    .onFinishChange(function(){
      do_fast_stuff();
    });
  panel_floor.add(params.floor.panel, 'temperature').min(tempMin).max(tempMax).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.panel.temperature, true) });
  panel_floor.add(params.floor.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.panel.emissivity, true) });

  var panel_floor_width = panel_floor.add(params.floor.panel, 'width').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_floor_height = panel_floor.add(params.floor.panel, 'height').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  var panel_floor_xpos = panel_floor.add(params.floor.panel, 'xposition').min(0.1).max(mrt.room.width - 2 * panelBorderMin).step(0.01)
  var panel_floor_ypos = panel_floor.add(params.floor.panel, 'yposition').min(0.1).max(mrt.room.depth - 2 * panelBorderMin).step(0.01)
  _.each([panel_floor_width, panel_floor_height, panel_floor_xpos, panel_floor_ypos], function(g){
    g.onFinishChange(function(){
      if (params.floor.panel.active){
        view_factors_need_updating = true;
        calculate_all();
      }
    });
  });

  // Occupant gui /////////////////////

  var f_occupant = gui.addFolder('Occupant')

  f_occupant.add(mrt.occupant, 'posture', [ 'seated', 'standing', 'supine' ] )
    .onFinishChange(function(){
      view_factors_need_updating = true;
      calculate_all();
    })

  f_occupant.add(params, 'azimuth').min(0.0).max(360).step(1)
    .onFinishChange(function(){
      mrt.occupant.azimuth = Math.PI * params.azimuth / 180;
      view_factors_need_updating = true;
      calculate_all();
    })

  // Etc ... /////////////////////

  // SolarCal

  solarcal = {
      'alt': 45,
      'az': 0,
      'fbes': 0.5,
      'Idir': 700,
      'asa': 0.7,
  }
  var solarcal_f = gui.addFolder('SolarCal');
  solarcal_f.add(solarcal, 'alt').min(0).max(90).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'az').min(0).max(360).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'fbes').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'Idir').min(0).max(1500).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'asa').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });

  // Comfort

  comfort = {
      'ta': 25,
      'vel': 0.15,
      'rh': 50,
      'met': 1.1,
      'clo': 0.5
  }
  var f_comfort = gui.addFolder('Thermal Comfort')
  f_comfort.add(comfort, 'ta').min(0).max(50).step(0.1)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'rh').min(0).max(100).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'vel').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'met').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'clo').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });

  gui.add(params, 'display', [
          'MRT',
          'Longwave MRT',
          'Shortwave dMRT',
          'Direct shortwave dMRT',
          'Diffuse shortwave dMRT',
          'Reflected shortwave dMRT',
          'PMV'
  ]).onFinishChange(function(){ do_fast_stuff(); });

  gui.add(params, 'autoscale')
    .onFinishChange(function(){ do_fast_stuff(); });
  gui.add(params, 'scaleMax').min(0).max(100).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  gui.add(params, 'scaleMin').min(0).max(100).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });

  gui.add(params, 'setGlobalSurfaceTemp').min(tempMin).max(tempMax).step(1)
    .onFinishChange(function(){ link_temps(); });  

  gui.add(params, 'update');

  function set_panel_guis(){
    panel_wall1_width.max(mrt.room.width - 2* panelBorderMin);
    panel_wall1_height.max(mrt.room.height - 2* panelBorderMin);
    panel_wall1_xpos.max(mrt.room.width - 2* panelBorderMin);
    panel_wall1_ypos.max(mrt.room.height - 2* panelBorderMin);

    panel_wall2_width.max(mrt.room.depth - 2* panelBorderMin);
    panel_wall2_height.max(mrt.room.height - 2* panelBorderMin);
    panel_wall2_xpos.max(mrt.room.depth - 2* panelBorderMin);
    panel_wall2_ypos.max(mrt.room.height - 2* panelBorderMin);

    panel_wall3_width.max(mrt.room.width - 2* panelBorderMin);
    panel_wall3_height.max(mrt.room.height - 2* panelBorderMin);
    panel_wall3_xpos.max(mrt.room.width - 2* panelBorderMin);
    panel_wall3_ypos.max(mrt.room.height - 2* panelBorderMin);

    panel_wall4_width.max(mrt.room.depth - 2* panelBorderMin);
    panel_wall4_height.max(mrt.room.height - 2* panelBorderMin);
    panel_wall4_xpos.max(mrt.room.depth - 2* panelBorderMin);
    panel_wall4_ypos.max(mrt.room.height - 2* panelBorderMin);

    panel_ceiling_width.max(mrt.room.width - 2* panelBorderMin);
    panel_ceiling_height.max(mrt.room.depth - 2* panelBorderMin);
    panel_ceiling_xpos.max(mrt.room.width - 2* panelBorderMin);
    panel_ceiling_ypos.max(mrt.room.depth - 2* panelBorderMin);

    panel_floor_width.max(mrt.room.width - 2* panelBorderMin);
    panel_floor_height.max(mrt.room.depth - 2* panelBorderMin);
    panel_floor_xpos.max(mrt.room.width - 2* panelBorderMin);
    panel_floor_ypos.max(mrt.room.depth - 2* panelBorderMin);
  };
  
  function link_temps(){
    params.wall1.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('wall1', 'temperature', params.wall1.temperature, false);
    //params.wall1.panel.temperature = params.setGlobalSurfaceTemp;
    //set_surface_property('panel_wall1', 'temperature', params.wall1.panel.temperature, true);
    params.wall2.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('wall2', 'temperature', params.wall2.temperature, false);
    params.wall3.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('wall3', 'temperature', params.wall3.temperature, false);
    params.wall4.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('wall4', 'temperature', params.wall4.temperature, false);
    params.ceiling.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('ceiling', 'temperature', params.ceiling.temperature, false);
    params.floor.temperature = params.setGlobalSurfaceTemp;
    set_surface_property('floor', 'temperature', params.floor.temperature, false);
     
    //update gui displays to match values stored in fields
    _.each([f_wall1, f_wall2, f_wall3, f_wall4, f_floor, f_ceiling], function(g){
        g.updateDisplay();
    });
    
    do_fast_stuff();       
  };
  
  // Lights
  var ambientLight = new THREE.AmbientLight( 0x999999 );
  scene.add( ambientLight );

  directionalLight = new THREE.DirectionalLight( 0x808080, 1.0 );
  directionalLight.position.set( 0, 1, 0 );
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialiasing: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  function onWindowResize(){
    camera.setSize( window.innerWidth, window.innerHeight );
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  set_wall_properties();
  render_zone();
  update_view_factors();
  update_shortwave_components();
  update_visualization();
}

function calculate_all(_update_view_factors){

  update_zone();
  setTimeout(function(){
    if (_update_view_factors) {
      update_view_factors();
      document.getElementById('calculating').style.display = "none";
    }
    do_fast_stuff();
  }, 1);
}

function update_zone(){
  remove_zone();
  set_wall_properties();
  render_zone();
}

function do_fast_stuff(){
  update_shortwave_components();
  update_visualization();
};

function setOpacity(opacity){
  for (var i = 0; i < scene.children.length; i++){
    var ch = scene.children[i];
    if (ch.hasOwnProperty('material')){
      ch.material.opacity = opacity / 100;
    }
  }
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function calculate_view_factors(point) {
  mrt.occupant.position.x = point.x;
  mrt.occupant.position.y = point.z;
  var my_vfs = mrt.view_factors();
  return my_vfs;
}

function get_window_objects() {
  var window_names = [];
  _.each(mrt.walls, function(w) {
    if (params[w.name].panel.window && params[w.name].panel.active) {
      window_names.push(w.name + 'panel1');
    }
  });

  var window_objects = _.map(window_names, function(window_name) {
    var w = _.find(scene.children, function(o){
      return o.name == window_name;
    });
    return w;
  });

  return window_objects;
}

function get_window_object_vfs(window_objects, i) {
  var window_object_vfs = _.map(window_objects, function(w) {
    return _.find(view_factors[i], function(o){
      return o.name == w.name;
    }).view_factor;
  });
  return window_object_vfs;
}

function render() {
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );

  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
  var intersects = raycaster.intersectObject( plane, true );
  if ( intersects.length > 0 ) {
    var display_value;
    var my_point = intersects[0].point.clone();
    my_point.x = my_point.x - mrt.room.width / 2;
    my_point.y = my_point.z - mrt.room.depth / 2;
    my_point.z = 0;
    var point_view_factors = calculate_view_factors(intersects[0].point);
    var longwave_mrt = mrt.calc(point_view_factors);

    var window_objects = get_window_objects();

    if (window_objects) {
      var window_object_vfs = _.map(window_objects, function(w) {
        return _.find(point_view_factors, function(o){
          return o.name == w.name;
        }).view_factor;
      });
      var my_erf = calculate_erf_point(my_point,
          solarcal.skydome_center, window_objects, window_object_vfs);
    } else {
      my_erf = {'dMRT_direct': 0, 'dMRT_diff': 0, 'dMRT_refl': 0, 'dMRT': 0, 'ERF': 0};
    }

    if (params.display === "Longwave MRT") {
      display_value = longwave_mrt;
    } else if (params.display === "MRT"){
      display_value = longwave_mrt + my_erf.dMRT;
    } else if (params.display === "Shortwave dMRT") {
      display_value = my_erf.dMRT;
    } else if (params.display === "Direct shortwave dMRT") {
      display_value = my_erf.dMRT_direct;
    } else if (params.display === "Diffuse shortwave dMRT") {
      display_value = my_erf.dMRT_diff;
    } else if (params.display === "Reflected shortwave dMRT") {
      display_value = my_erf.dMRT_refl;
    } else if (params.display === "PMV") {
      var mrt_total = longwave_mrt + my_erf.dMRT;
      var my_pmv = comf.pmvElevatedAirspeed(comfort.ta, mrt_total,
        comfort.vel, comfort.rh, comfort.met, comfort.clo, 0);
      display_value = my_pmv.pmv;
    }
    document.getElementById('occupant-position').innerHTML = "Occupant (x, y): ("
      + intersects[0].point.x.toFixed(1) + ", " + intersects[0].point.z.toFixed(1) + ")";
    document.getElementById('cursor-temperature').innerHTML = params.display + ": "
      + display_value.toFixed(1);
  } else {
    document.getElementById('cursor-temperature').innerHTML = "";
    document.getElementById('occupant-position').innerHTML = "";
  }

  directionalLight.position.copy( camera.position );
  directionalLight.position.normalize();
  renderer.render( scene, camera );
  controls.update();
}

function update_view_factors(){

  view_factors = _.map(plane.geometry.vertices, function(v){
    var my_vector = new THREE.Vector3();
    my_vector.copy(v);
    my_vector.applyMatrix4( plane.matrixWorld );
    mrt.occupant.position.x = my_vector.x;
    mrt.occupant.position.y = my_vector.z;
    var vfs = mrt.view_factors();
    var vfsum = 0;
    for (var i = 0; i < vfs.length; i++){
      vfsum += vfs[i].view_factor;
    }
    norm_factor = 1.0 / vfsum;
    for (var i = 0; i < vfs.length; i++){
      vfs[i].view_factor *= norm_factor;
    }
    return vfs;
  });
  view_factors_need_updating = false;

}

function update_shortwave_components() {

  var window_objects = get_window_objects();
  var window_object_vfs = get_window_object_vfs(solarcal.window_objects);

  var r = 1.3 * _.max(mrt.room);

  var floor = _.find(scene.children, function(c){
    return c.name == 'floor';
  });
  solarcal.skydome_center = new THREE.Vector3(0, 0, 0);
  for (var i = 0; i < floor.geometry.vertices.length; i++){
    var v = floor.geometry.vertices[i];
    solarcal.skydome_center.add(v);
  }
  solarcal.skydome_center.divideScalar(4);

  alt_rad = Math.PI / 2 - Math.PI * solarcal.alt / 180;
  az_rad = Math.PI * solarcal.az / 180;

  sun.position.x = solarcal.skydome_center.x + r * Math.sin(alt_rad) * Math.cos(az_rad);
  sun.position.y = solarcal.skydome_center.y + r * Math.cos(alt_rad);
  sun.position.z = solarcal.skydome_center.z + r * Math.sin(alt_rad) * Math.sin(az_rad);

  if (window_objects) {
    ERF_vertex_values = _.map(plane.geometry.vertices, function(v, i){
      window_object_vfs = get_window_object_vfs(window_objects, i);
      return calculate_erf_point(v,
                                 solarcal.skydome_center,
                                 window_objects,
                                 window_object_vfs);
    });
  } else {
    // if no window object, all components are zero
    ERF_vertex_values = _.map(plane.geometry.vertices, function(){
      return {'dMRT_direct': 0, 'dMRT_diff': 0, 'dMRT_refl': 0, 'dMRT': 0, 'ERF': 0};
    });
  }
}

function calculate_erf_point(v, skydome_center, window_objects, window_object_vfs){
  // Check direct exposure
  var my_vector = new THREE.Vector3();
  my_vector.copy(v);
  my_vector.applyMatrix4( plane.matrixWorld );

  // this vector is used for the sun's position in
  // computations whereas the sun object is an icon
  var my_sun_dir = new THREE.Vector3();
  my_sun_dir.copy(sun.position);
  my_sun_dir.sub(skydome_center);
  my_sun_dir.multiplyScalar(1000);
  my_sun_dir.add(skydome_center);
  my_sun_dir.sub(my_vector);

  var sun_position = new THREE.Vector3();
  sun_position.copy(my_sun_dir);
  sun_position.normalize();

  raycaster.set(my_vector, sun_position);

  var tsol_factor = 0;
  var tsol = 0;
  for (var i = 0; i < window_objects.length; i++) {
    var window_object = window_objects[i];
    var intersects = raycaster.intersectObject( window_object );
    if (intersects.length != 0){

      var v_normal = window_object.geometry.faces[0].normal;
      var relative_sun_position = new THREE.Vector3();
      relative_sun_position.copy(sun.position);
      relative_sun_position.sub(skydome_center);
      relative_sun_position.normalize();
      var dot = v_normal.dot(relative_sun_position);
      var th = (180 * Math.acos(dot) / Math.PI);
      if (th > 90) th = 180 - th;

      var window_object_parent = window_object.name.replace("panel1","");
      var tsol = params[window_object_parent].panel.tsol;

      // this equation is a fit of an empirical model of
      // clear glass transmittance as a function of angle
      // of incidence, from ASHRAE Handbook 1985 27.14.
      var tsol_factor = -7e-8 * Math.pow(th, 4) + 7e-6 * Math.pow(th, 3)
        - 0.0002 * Math.pow(th, 2) + 0.0016 * th + 0.997
      //scene.add(new THREE.ArrowHelper( sun_position, my_vector, 10, 0x00ff00))

      break;
    }
  }

  var svvf = _.reduce(window_object_vfs, function(memo, num){ return memo + num; }, 0);
  var sharp = solarcal.az - (180 * mrt.occupant.azimuth / Math.PI);
  if (sharp < 0) sharp += 360;
  var my_erf = ERF(solarcal.alt, sharp, mrt.occupant.posture,
    solarcal.Idir, tsol, svvf,
    solarcal.fbes, solarcal.asa, tsol_factor)
  return my_erf;
}

function update_visualization(){

  if (view_factors_need_updating) {
    var vertex_colors = _.map(view_factors, function(){
      return new THREE.Color(1, 1, 1);
    });
    document.getElementById("scale-maximum").innerHTML = "-";
    document.getElementById('scale-minimum').innerHTML = "-";
  } else {
    var vertex_values;
    if (params.display == 'MRT') {
      vertex_values = _.map(view_factors, function(vfs, i){
        return mrt.calc(vfs) + ERF_vertex_values[i].dMRT;
      });
    } else if (params.display == 'Longwave MRT'){
      vertex_values = _.map(view_factors, function(vfs){
        return mrt.calc(vfs);
      });
    } else if (params.display == 'Shortwave dMRT') {
      vertex_values = _.map(ERF_vertex_values, function(v){
        return v.dMRT;
      });
    } else if (params.display == 'Direct shortwave dMRT') {
      vertex_values = _.map(ERF_vertex_values, function(v){
        return v.dMRT_direct;
      });
    } else if (params.display == 'Diffuse shortwave dMRT') {
      vertex_values = _.map(ERF_vertex_values, function(v){
        return v.dMRT_diff;
      });
    } else if (params.display == 'Reflected shortwave dMRT') {
      vertex_values = _.map(ERF_vertex_values, function(v){
        return v.dMRT_refl;
      });
    } else if (params.display == 'PMV') {
      var mrt_values = _.map(view_factors, function(vfs, i){
        return mrt.calc(vfs) + ERF_vertex_values[i].dMRT;
      });
      vertex_values = _.map(mrt_values, function(mrt_val) {
        var my_pmv = comf.pmvElevatedAirspeed(comfort.ta, mrt_val,
          comfort.vel, comfort.rh, comfort.met, comfort.clo, 0);
        return my_pmv.pmv;
      });

    }

    if (params.autoscale) {
      scale_min = _.min(vertex_values);
      scale_max = _.max(vertex_values);
    } else {
      scale_min = params.scaleMin;
      scale_max = params.scaleMax;
    }

    document.getElementById("scale-maximum").innerHTML = scale_max.toFixed(1);
    document.getElementById("scale-minimum").innerHTML = scale_min.toFixed(1);
    var vertex_colors = _.map(vertex_values, function(v){
      var value_range = scale_max - scale_min;
      if (value_range == 0){
        return new THREE.Color(0, 0, 1);
      } else {
        var r = (v - scale_min) / (scale_max - scale_min);
        return new THREE.Color(r, 0, 1 - r);
      }
    });
  }

  var faceIndices = [ 'a', 'b', 'c'];
  for (var i = 0; i < plane.geometry.faces.length; i++){
    var f = plane.geometry.faces[i];
    f.vertexColors = [];
    for (var j = 0; j < 3; j++){
      var idx = f[ faceIndices[ j ] ];
      f.vertexColors.push( vertex_colors[ idx ] );
    }
  }
  plane.geometry.colorsNeedUpdate = true;
}
