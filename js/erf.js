function find_span(arr, x){
    // for ordered array arr and value x, find the left index
    // of the closed interval that the value falls in.
    for (var i = 0; i < arr.length - 1; i++){
        if (x <= arr[i+1] && x >= arr[i]){
            return i;
        }
    }
    return -1;
}

function get_fp(alt, az, posture){
    //  alt : altitude of sun in degrees [0, 90] Integer
    //  az : azimuth of sun in degrees [0, 180] Integer

    if (posture == 'standing' || posture == 'supine'){
        var fp_table = [[0.25375,0.25375,0.22765,0.18705,0.14935,0.1044,0.05945],
            [0.24795,0.24795,0.22475,0.1827,0.145,0.1015,0.05945],
            [0.23925,0.23925,0.2175,,0.1769,0.13775,0.0957,0.05945],
            [0.22475,0.22475,0.199375,0.1653,0.126875,0.0899,0.05945],
            [0.205175,0.205175,0.181975,0.1508,,0.116,0.08265,0.05945],
            [0.1827,0.1827,0.1653,0.1363,0.10875,0.0783,0.05945],
            [0.16675,0.16675,0.15515,0.1305,0.1073,0.0783,0.05945],
            [0.17545,0.17545,0.16095,0.1305,0.110925,0.0812,0.05945],
            [0.19865,0.19865,0.177625,0.147175,0.119625,0.0841,0.05945],
            [0.2204,0.2204,0.19575,0.1595,0.12615,0.087725,0.05945],
            [0.2378,0.2378,0.21025,0.16965,0.132675,0.090625,0.05945],
            [0.2494,0.2494,0.2204,0.1769,0.13775,0.0928,0.05945],
            [0.251575,0.251575,0.2233,0.17835,0.138475,0.0928,0.05945]];
    } else if (posture == 'seated'){
        var fp_table = [[0.20184,0.225504,0.21228,0.210888,0.182352,0.155904,0.123192],
            [0.203232,0.228288,0.204624,0.200448,0.186528,0.157992,0.123192],
            [0.200448,0.231072,0.207408,0.20184,0.183744,0.154512,0.123192],
            [0.190704,0.226896,0.204624,0.201144,0.175392,0.148944,0.123192],
            [0.176784,0.214368,0.19488,0.192096,0.167736,0.140592,0.123192],
            [0.16008,0.196272,0.182352,0.18096,0.162168,0.134328,0.123192],
            [0.150336,0.18096,0.172608,0.169824,0.15312,0.129456,0.123192],
            [0.162864,0.179568,0.164256,0.157992,0.144768,0.12528,0.123192],
            [0.182352,0.18096,0.155904,0.144768,0.136416,0.122496,0.123192],
            [0.19488,0.18096,0.14616,0.133632,0.128064,0.11832,0.123192],
            [0.207408,0.178176,0.135024,0.121104,0.116928,0.116928,0.123192],
            [0.212976,0.174,0.12528,0.108576,0.108576,0.115536,0.123192],
            [0.2088,0.16704,0.116928,0.105792,0.105792,0.114144,0.123192]];
    }

    if (az > 180) {
      az = 360 - az;
    }
    if (posture == 'supine') {
      // transpose alt and az for a supine person
      alt_temp = alt;
      alt = Math.abs(90 - az)
      az = alt_temp;
    }

    var fp;
    var alt_range = [0, 15, 30, 45, 60, 75, 90];
    var az_range = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
    var alt_i = find_span(alt_range, alt);
    var az_i = find_span(az_range, az);
    var fp11 = fp_table[az_i][alt_i];
    var fp12 = fp_table[az_i][alt_i+1];
    var fp21 = fp_table[az_i+1][alt_i];
    var fp22 = fp_table[az_i+1][alt_i+1];

    var az1 = az_range[az_i];
    var az2 = az_range[az_i+1];
    var alt1 = alt_range[alt_i];
    var alt2 = alt_range[alt_i+1];
    
    // bilinear interpolation
    fp = fp11 * (az2 - az) * (alt2 - alt);
    fp += fp21 * (az - az1) * (alt2 - alt);
    fp += fp12 * (az2 - az) * (alt - alt1);
    fp += fp22 * (az - az1) * (alt - alt1);
    fp /= (az2 - az1) * (alt2 - alt1);

    return fp;
}

function ERF(alt, az, posture, Idir, tsol, fsvv, fbes, asa, tsol_factor){
    //  ERF function to estimate the impact of solar radiation on occupant comfort
    //  INPUTS:
    //  alt : altitude of sun in degrees [0, 90]
    //  az : azimuth of sun in degrees [0, 180]
    //  posture: posture of occupant ('seated', 'standing', or 'supine')
    //  Idir : direct beam intensity (normal)
    //  tsol: total solar transmittance (SC * 0.87)
    //  fsvv : sky vault view fraction : fraction of sky vault in occupant's view [0, 1]
    //  fbes : fraction body exposed to sun [0, 1]
    //  asa : avg shortwave abs : average shortwave absorptivity of body [0, 1]
    //  tsol_factor : (optional) correction to tsol based on angle of incidence

    if (tsol_factor === undefined) {
      tsol_factor = 1.0;
    }

    var DEG_TO_RAD = 0.0174532925;
    var hr = 6;
    var Idiff = 0.175 * Idir * Math.sin(alt * DEG_TO_RAD);

    // FLoor reflectance
    var Rfloor = 0.6;
    
    var fp = get_fp(alt, az, posture);
    
    if (posture=='standing' || posture=='supine'){
        var feff = 0.725;
    } else if (posture=='seated'){
        var feff = 0.696;
    } else {
        console.log("Invalid posture (choose seated, seated, or supine)");
        return;
    }

    var sw_abs = asa;
    var lw_abs = 0.95;

    var E_direct = fp * tsol * fbes * Idir * tsol_factor;
    var E_diff = feff * fsvv * 0.5 * tsol * Idiff;
    var E_refl = feff * fsvv * 0.5 * tsol * (Idir * Math.sin(alt * DEG_TO_RAD) + Idiff) * Rfloor;

    var E_solar = E_diff + E_direct + E_refl;

    var ERF_direct = E_direct * (sw_abs / lw_abs);
    var dMRT_direct = ERF_direct / (hr * feff);

    var ERF_diff = E_diff * (sw_abs / lw_abs);
    var dMRT_diff = ERF_diff / (hr * feff);

    var ERF_refl = E_refl * (sw_abs / lw_abs);
    var dMRT_refl = ERF_refl / (hr * feff);

    var ERF = E_solar * (sw_abs / lw_abs);
    var dMRT = ERF / (hr * feff);

    return {"dMRT_diff": dMRT_diff, "dMRT_direct": dMRT_direct, "dMRT_refl": dMRT_refl, "ERF": ERF, "dMRT": dMRT};
}
