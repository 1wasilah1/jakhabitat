var APP_DATA = {
  "scenes": [
    {
      "id": "0-lorong",
      "name": "lorong",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.00017938540796080815,
          "pitch": 0.09284928372977852,
          "rotation": 0,
          "target": "1-view-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-view-1",
      "name": "view 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -1.786325893248165,
          "pitch": 0.9257311118421683,
          "rotation": 0,
          "target": "2-view-2"
        },
        {
          "yaw": 1.6344839975519942,
          "pitch": 0.8426868527447606,
          "rotation": 0.7853981633974483,
          "target": "0-lorong"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-view-2",
      "name": "view 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.29881263533064484,
          "pitch": 0.9690019262673673,
          "rotation": 0,
          "target": "3-view-3"
        },
        {
          "yaw": 1.838804650716929,
          "pitch": 0.9923574528076493,
          "rotation": 5.497787143782138,
          "target": "1-view-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-view-3",
      "name": "view 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -3.0563739122218863,
          "pitch": 0.8915138647430503,
          "rotation": 0,
          "target": "2-view-2"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "kanaya studio",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": true,
    "viewControlButtons": true
  }
};
