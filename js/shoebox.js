
var container, stats;
var camera, scene, renderer, raycaster, projector, INTERSECTED, directionalLight;
var surfaces = [];
var mouse = new THREE.Vector2();

mrt.occupant = {
    'position': {'x': 1, 'y': 1},
    'azimuth': 0, //Math.PI / 3, 
    'posture': 'seated',
};

mrt.room = {
    'depth': 15.0, 
    'width': 20.0, 
    'height': 2.6,
}

params = {
    'opacity': 0, 
    'wall1': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 1.0,
        'xposition': 4.0,
        'yposition': 0.4,
      },
    },
    'wall2': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 36.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 1.0,
        'xposition': 4.0,
        'yposition': 0.4,
      },
    },
    'wall3': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 38.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 1.0,
        'xposition': 4.0,
        'yposition': 0.4,
      },
    },
    'wall4': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 1.0,
        'xposition': 4.0,
        'yposition': 0.4,
      },
    },
    'ceiling': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 50.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 5.0,
        'xposition': 2.0,
        'yposition': 2.0,
      },
    },
    'floor': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 5.0,
        'height': 1.0,
        'xposition': 4.0,
        'yposition': 0.4,
      },
    },
    'autocalculate': true,
    'calculate now': function(){
      calculate_all();
    }
};

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
          'temperature': params.ceiling.temperature,
          'emissivity': params.ceiling.emissivity,
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

    var wall1 = { 'vertices': [{'x': 0, 'y': 0, 'z': 0},
      {'x': mrt.room.width, 'y': 0, 'z': 0},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
      {'x': 0, 'y': mrt.room.height, 'z': 0}],
    };
    if (params.wall1.panel.active){
      var u0 = params.wall1.panel.xposition;
      var v0 = params.wall1.panel.yposition;
      var w = params.wall1.panel.width;
      var h = params.wall1.panel.height;
      wall1.children = [
        { 'vertices': [{'x': u0, 'y': v0, 'z': 0 },
                       {'x': u0, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0, 'z': 0 }],
          'radiant_t': params.wall1.panel.temperature,
          'emissivity': params.wall1.panel.emissivity,
        },
      ];
    } else {
      wall1.children = [];
    }

    var wall2 = { 'vertices': [{'x': mrt.room.width, 'y': 0, 'z': 0},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
      {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth}],
    };
    if (params.wall2.panel.active){
      var u0 = params.wall2.panel.xposition;
      var v0 = params.wall2.panel.yposition;
      var w = params.wall2.panel.width;
      var h = params.wall2.panel.height;
      wall2.children = [
        { 'vertices': [{'x': mrt.room.width, 'y': v0, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 + w },
                       {'x': mrt.room.width, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall2.panel.temperature,
          'emissivity': params.wall2.panel.emissivity,
        },
      ];
    } else {
      wall2.children = [];
    }

    var wall3 = { 'vertices': [{'x': 0, 'y': 0, 'z': mrt.room.depth},
      {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
      {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}],
    };
    /*
    if (params.wall3.panel.active){
      var u0 = params.wall3.panel.xposition;
      var v0 = params.wall3.panel.yposition;
      var w = params.wall3.panel.width;
      var h = params.wall3.panel.height;
      wall3.children = [
        { 'vertices': [{'x': mrt.room.width, 'y': v0, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 + w },
                       {'x': mrt.room.width, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall3.panel.temperature,
          'emissivity': params.wall3.panel.emissivity,
        },
      ];
    } else {
      wall3.children = [];
    }*/

    var wall4 = { 'vertices': [{'x': 0, 'y': 0, 'z': 0},
      {'x': 0, 'y': mrt.room.height, 'z': 0},
      {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth},
      {'x': 0, 'y': 0, 'z': mrt.room.depth}],
    };

    if (params.wall4.panel.active){
      var u0 = params.wall4.panel.xposition;
      var v0 = params.wall4.panel.yposition;
      var w = params.wall4.panel.width;
      var h = params.wall4.panel.height;
      wall4.children = [
        { 'vertices': [{'x': 0, 'y': v0, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 + w },
                       {'x': 0, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall4.panel.temperature,
          'emissivity': params.wall4.panel.emissivity,
        },
      ];
    } else {
      wall4.children = [];
    }
    
    var ceiling = { 'vertices': [{'x': 0, 'y': mrt.room.height, 'z': 0},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
      {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
      {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}],
    };

    if (params.ceiling.panel.active){
      var u0 = params.ceiling.panel.xposition;
      var v0 = params.ceiling.panel.yposition;
      var w = params.ceiling.panel.width;
      var h = params.ceiling.panel.height;
      ceiling.children = [
        { 'vertices': [{'x': u0, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 + h },
                       {'x': u0, 'y': mrt.room.height, 'z': v0 + h }],
          'radiant_t': params.ceiling.panel.temperature,
          'emissivity': params.ceiling.panel.emissivity,
        },
      ];
    } else {
      ceiling.children = [];
    }

    var floor = { 'vertices': [{'x': 0, 'y': 0, 'z': 0},
      {'x': mrt.room.width, 'y': 0, 'z': 0},
      {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
      {'x': 0, 'y': 0, 'z': mrt.room.depth}],
    };

    if (params.floor.panel.active){
      var u0 = params.floor.panel.xposition;
      var v0 = params.floor.panel.yposition;
      var w = params.floor.panel.width;
      var h = params.floor.panel.height;
      floor.children = [
        { 'vertices': [{'x': u0, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 + h },
                       {'x': u0, 'y': 0, 'z': v0 + h }],
          'radiant_t': params.floor.panel.temperature,
          'emissivity': params.floor.panel.emissivity,
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

function wallPanelMesh(geometry, texture){
  var material = new THREE.MeshPhongMaterial( { 
      color: 0xffffff, 
      map: texture, 
      bumpMap: texture, 
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
  var objsToRemove = _.rest(scene.children, 1);
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
  var aspect_ratio = mrt.room.width / mrt.room.height;
  var Nx = Math.floor(8 / aspect_ratio);
  var Ny = Math.floor(8 * aspect_ratio);

  var plane_geometry = new THREE.PlaneGeometry( mrt.room.width - margin.x, mrt.room.depth - margin.y, Nx, Ny );

  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors,
  });

  plane = new THREE.Mesh( plane_geometry, material );
  plane.rotation.x = Math.PI / 2;
  plane.position.x = mrt.room.width / 2;
  plane.position.y = mrt.room.height / 2;
  plane.position.z = mrt.room.depth / 2;
  plane.geometry.dynamic = true; // so that we can change the vertex colors
  plane.name = "visualization";
  scene.add( plane );

  // Surfaces

  var Np = z.length;
  var thetax, thetaz
  for (var i = 0; i < Np; i++){ 
    var p = z[i];
    var wall = wallPanelGeometry(p.vertices);
    var panel_texture = THREE.ImageUtils.loadTexture( 'img/wall.jpg' );

    if (p.hasOwnProperty('children')){

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
      h.makeTranslation(0, wall.vertices[0].y, 0);

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
        var mesh = wallPanelMesh(panel, panel_texture);
        scene.add(mesh);
        surfaces.push(mesh);

        // do we need the edges for the children?
        // edges
        //var egh = new THREE.EdgesHelper(mesh, 0x444444);
        //egh.material.linewidth = 2;
        //scene.add(egh);
      }
      wall = new THREE.ShapeGeometry(wallShape);
      wall.applyMatrix( ti );
      wall.applyMatrix( h );
    }

    // wall texture
    var wall_texture = THREE.ImageUtils.loadTexture( 'img/wall1.jpg' );
    var material = new THREE.MeshPhongMaterial( { 
        color: 0xffffff, 
        map: wall_texture, 
        bumpMap: wall_texture, 
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
  camera.position.x = mrt.room.width * 2;
  camera.position.y = mrt.room.height * 2;
  camera.position.z = mrt.room.depth * 2;
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  projector = new THREE.Projector();

  // Gui
  var gui = new dat.GUI();

  var f_room = gui.addFolder('Room')
  f_room.add(mrt.room, 'width').min(2).max(100).step(1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    });
  f_room.add(mrt.room, 'depth').min(2).max(100).step(1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    })
  f_room.add(mrt.room, 'height').min(2).max(16).step(0.1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    });

  function set_surface_property(surface_name, property, value, panel){         
    var surface = _.find(mrt.walls, function(r){ return r.name == surface_name; });
    if (panel){
      surface.subsurfaces[0][property] = value;
    } else {
      surface[property] = value;
    }
    if (params.autocalculate){
      mrt_mesh();
    }
  }

  // Wall 1 gui /////////////////////

  var f_wall1 = gui.addFolder('Wall 1');
  f_wall1.add(params.wall1, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.temperature, false) });
  f_wall1.add(params.wall1, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.emissivity, false) });

  var panel_wall1 = f_wall1.addFolder('Panel');
  panel_wall1.add(params.wall1.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall1.add(params.wall1.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.panel.temperature, true) });
  panel_wall1.add(params.wall1.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.panel.emissivity, true) });

  var panel_wall1_width = panel_wall1.add(params.wall1.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall1_height = panel_wall1.add(params.wall1.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall1_xpos = panel_wall1.add(params.wall1.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall1_ypos = panel_wall1.add(params.wall1.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall1_width, panel_wall1_height, panel_wall1_xpos, panel_wall1_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Wall 2 gui /////////////////////

  var f_wall2 = gui.addFolder('Wall 2');
  f_wall2.add(params.wall2, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.temperature, false) });
  f_wall2.add(params.wall2, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.emissivity, false) });

  var panel_wall2 = f_wall2.addFolder('Panel');
  panel_wall2.add(params.wall2.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall2.add(params.wall2.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.panel.temperature, true) });
  panel_wall2.add(params.wall2.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.panel.emissivity, true) });

  var panel_wall2_width = panel_wall2.add(params.wall2.panel, 'width').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall2_height = panel_wall2.add(params.wall2.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall2_xpos = panel_wall2.add(params.wall2.panel, 'xposition').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall2_ypos = panel_wall2.add(params.wall2.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall2_width, panel_wall2_height, panel_wall2_xpos, panel_wall2_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Wall 3 gui /////////////////////

  var f_wall3 = gui.addFolder('Wall 3');
  f_wall3.add(params.wall3, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall3', 'temperature', params.wall3.temperature, false) });
  f_wall3.add(params.wall3, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall3', 'emissivity', params.wall3.emissivity, false) });

  var panel_wall3 = f_wall3.addFolder('Panel');
  panel_wall3.add(params.wall3.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall3.add(params.wall3.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall3', 'temperature', params.wall3.panel.temperature, true) });
  panel_wall3.add(params.wall3.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall3', 'emissivity', params.wall3.panel.emissivity, true) });

  var panel_wall3_width = panel_wall3.add(params.wall3.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall3_height = panel_wall3.add(params.wall3.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall3_xpos = panel_wall3.add(params.wall3.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall3_ypos = panel_wall3.add(params.wall3.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall3_width, panel_wall3_height, panel_wall3_xpos, panel_wall3_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Wall 4 gui /////////////////////

  var f_wall4 = gui.addFolder('Wall 4');
  f_wall4.add(params.wall4, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.temperature, false) });
  f_wall4.add(params.wall4, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.emissivity, false) });

  var panel_wall4 = f_wall4.addFolder('Panel');
  panel_wall4.add(params.wall4.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall4.add(params.wall4.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.panel.temperature, true) });
  panel_wall4.add(params.wall4.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.panel.emissivity, true) });

  var panel_wall4_width = panel_wall4.add(params.wall4.panel, 'width').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall4_height = panel_wall4.add(params.wall4.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall4_xpos = panel_wall4.add(params.wall4.panel, 'xposition').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall4_ypos = panel_wall4.add(params.wall4.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall4_width, panel_wall4_height, panel_wall4_xpos, panel_wall4_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Ceiling gui /////////////////////

  var f_ceiling = gui.addFolder('Ceiling')
  f_ceiling.add(params.ceiling, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.temperature, false) });
  f_ceiling.add(params.ceiling, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.emissivity, false) });

  var panel_ceiling = f_ceiling.addFolder('Panel');
  panel_ceiling.add(params.ceiling.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_ceiling.add(params.ceiling.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.panel.temperature, true) });
  panel_ceiling.add(params.ceiling.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.panel.emissivity, true) });

  var panel_ceiling_width = panel_ceiling.add(params.ceiling.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_ceiling_height = panel_ceiling.add(params.ceiling.panel, 'height').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_ceiling_xpos = panel_ceiling.add(params.ceiling.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_ceiling_ypos = panel_ceiling.add(params.ceiling.panel, 'yposition').min(0.1).max(mrt.room.depth).step(0.01)
  
  _.each([panel_ceiling_width, panel_ceiling_height, panel_ceiling_xpos, panel_ceiling_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Floor gui /////////////////////

  var f_floor = gui.addFolder('Floor');
  f_floor.add(params.floor, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.temperature, false) });
  f_floor.add(params.floor, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.emissivity, false) });

  var panel_floor = f_floor.addFolder('Panel');
  panel_floor.add(params.floor.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_floor.add(params.floor.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.panel.temperature, true) });
  panel_floor.add(params.floor.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.panel.emissivity, true) });

  var panel_floor_width = panel_floor.add(params.floor.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_floor_height = panel_floor.add(params.floor.panel, 'height').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_floor_xpos = panel_floor.add(params.floor.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_floor_ypos = panel_floor.add(params.floor.panel, 'yposition').min(0.1).max(mrt.room.depth).step(0.01)
  
  _.each([panel_floor_width, panel_floor_height, panel_floor_xpos, panel_floor_ypos], function(g){
    g.onFinishChange(function(){ calculate_all(); });
  });

  // Occupant gui /////////////////////

  gui.add(mrt.occupant, 'posture', [ 'seated', 'standing' ] )
    .onFinishChange(function(){
      mrt_mesh();
    })

  gui.add(mrt.occupant, 'azimuth').min(0).max(Math.PI).step(0.1)
    .onFinishChange(function(){
      mrt_mesh();
    })

  // Etc ... /////////////////////

  gui.add(params, 'opacity').min(0).max(100).step(1)
    .onFinishChange(function(){ setOpacity(params.opacity) });

  gui.add(params, 'autocalculate');
  gui.add(params, 'calculate now');

  function set_panel_guis(){
    panel_wall1_width.max(mrt.room.width);
    panel_wall1_height.max(mrt.room.height);
    panel_wall1_xpos.max(mrt.room.width);
    panel_wall1_ypos.max(mrt.room.height);

    panel_wall2_width.max(mrt.room.depth);
    panel_wall2_height.max(mrt.room.height);
    panel_wall2_xpos.max(mrt.room.depth);
    panel_wall2_ypos.max(mrt.room.height);

    panel_wall3_width.max(mrt.room.width);
    panel_wall3_height.max(mrt.room.height);
    panel_wall3_xpos.max(mrt.room.width);
    panel_wall3_ypos.max(mrt.room.height);

    panel_wall4_width.max(mrt.room.depth);
    panel_wall4_height.max(mrt.room.height);
    panel_wall4_xpos.max(mrt.room.depth);
    panel_wall4_ypos.max(mrt.room.height);

    panel_ceiling_width.max(mrt.room.width);
    panel_ceiling_height.max(mrt.room.depth);
    panel_ceiling_xpos.max(mrt.room.width);
    panel_ceiling_ypos.max(mrt.room.depth);

    panel_floor_width.max(mrt.room.width);
    panel_floor_height.max(mrt.room.depth);
    panel_floor_xpos.max(mrt.room.width);
    panel_floor_ypos.max(mrt.room.depth);
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
  
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'click', onDocumentClick, false );
  
  function onWindowResize(){
    camera.setSize( window.innerWidth, window.innerHeight );
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  set_wall_properties();
  render_zone();
  mrt_mesh();
}

function calculate_all(){
  remove_zone();
  set_wall_properties();
  render_zone();
  setTimeout(mrt_mesh, 100);
}

function setOpacity(opacity){
  for (var i = 0; i < scene.children.length; i++){
    var ch = scene.children[i];
    if (ch.hasOwnProperty('material')){
      ch.material.opacity = opacity / 100;
    }
  }
}

function onDocumentClick( event ){
  if ( INTERSECTED ){
    console.log(INTERSECTED.uuid);
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
  stats.update();
}

function render() {
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
  var viz_plane = _.filter(scene.children, function(c){ return c.name == "visualization"; });
  var intersects = raycaster.intersectObjects( viz_plane );
  /*
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object) {
      if ( INTERSECTED ) {
        //INTERSECTED.material.ambient.setHex( INTERSECTED.currentHex );
        //INTERSECTED.material.transparent = true;
      }
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.ambient.getHex();
      INTERSECTED.material.ambient.setHex( 0xffffa0 );
    }
  } else {
    if ( INTERSECTED ) INTERSECTED.material.ambient.setHex( INTERSECTED.currentHex );
    INTERSECTED = null;
  }
  */

  directionalLight.position.copy( camera.position );
  directionalLight.position.normalize();
  renderer.render( scene, camera );
  controls.update();
     
}

function mrt_mesh(){
  var mrt_vertices = _.map(plane.geometry.vertices, function(v){ 
    var vec = v.clone()
    vec.applyMatrix4( plane.matrixWorld );
    mrt.occupant.position.x = vec.x;
    mrt.occupant.position.y = vec.z;
    return mrt.calc();
  });
  var mrt_min = _.min(mrt_vertices);
  var mrt_max = _.max(mrt_vertices);

  mrt.occupant.position.x = 1;
  mrt.occupant.position.y = 1;
  console.log(mrt.calc());

  document.getElementById("scale-maximum").innerHTML = mrt_max.toFixed(1);
  document.getElementById('scale-minimum').innerHTML = mrt_min.toFixed(1);
  var mrt_colors = _.map(mrt_vertices, function(v_mrt){
    var mrt_range = mrt_max - mrt_min;
    if (mrt_range == 0){
      return new THREE.Color(0, 0, 1);
    } else {
      var r = (v_mrt - mrt_min) / (mrt_max - mrt_min);
      //return new THREE.Color(r, r, r);
      
      return new THREE.Color(r, 0, 1 - r);
      
      // my attempt to go from blue -> green -> red. whoa.
      //if (r < 0.5) {
      //  return new THREE.Color(0, 2 * r, 1 - 2 * r);
      //} else {
      //  return new THREE.Color(2 * r - 1, 2 - 2 * r, 0);
      //}
    }
  });

  var faceIndices = [ 'a', 'b', 'c'];
  for (var i = 0; i < plane.geometry.faces.length; i++){
    var f = plane.geometry.faces[i];
    f.vertexColors = [];
    for (var j = 0; j < 3; j++){
      var idx = f[ faceIndices[ j ] ];
      f.vertexColors.push( mrt_colors[ idx ] );
    }
  }
  plane.geometry.colorsNeedUpdate = true;
}
