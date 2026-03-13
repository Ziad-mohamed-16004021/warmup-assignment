// Delivery Driver Shift Tracker Assignment
const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime){

    let s = startTime.split(" ");
    let e = endTime.split(" ");

    let sParts = s[0].split(":");
    let eParts = e[0].split(":");

    let sHour = parseInt(sParts[0]);
    let sMin = parseInt(sParts[1]);
    let sSec = parseInt(sParts[2]);

    let eHour = parseInt(eParts[0]);
    let eMin = parseInt(eParts[1]);
    let eSec = parseInt(eParts[2]);

    if(s[1] === "pm" && sHour !== 12){
        sHour = sHour + 12;
    }

    if(s[1] === "am" && sHour === 12){
        sHour = 0;
    }

    if(e[1] === "pm" && eHour !== 12){
        eHour = eHour + 12;
    }

    if(e[1] === "am" && eHour === 12){
        eHour = 0;
    }

    let startSeconds = sHour*3600 + sMin*60 + sSec;
    let endSeconds = eHour*3600 + eMin*60 + eSec;

    let diff = endSeconds - startSeconds;

    let hours = Math.floor(diff/3600);
    let minutes = Math.floor((diff%3600)/60);
    let seconds = diff%60;

    if(minutes < 10) minutes = "0" + minutes;
    if(seconds < 10) seconds = "0" + seconds;

    return hours + ":" + minutes + ":" + seconds;
}


// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime){

    function convertToSeconds(time){

        let p = time.split(" ");
        let t = p[0].split(":");

        let h = parseInt(t[0]);
        let m = parseInt(t[1]);
        let s = parseInt(t[2]);

        if(p[1] === "pm" && h !== 12){
            h = h + 12;
        }

        if(p[1] === "am" && h === 12){
            h = 0;
        }

        return h*3600 + m*60 + s;
    }

    let start = convertToSeconds(startTime);
    let end = convertToSeconds(endTime);

    let startLimit = 8*3600;
    let endLimit = 22*3600;

    let idleSeconds = 0;

    if(start < startLimit){
        let before = startLimit - start;
        if(end < startLimit){
            before = end - start;
        }
        idleSeconds = idleSeconds + before;
    }

    if(end > endLimit){
        let after = end - endLimit;
        if(start > endLimit){
            after = end - start;
        }
        idleSeconds = idleSeconds + after;
    }

    let h = Math.floor(idleSeconds/3600);
    let m = Math.floor((idleSeconds%3600)/60);
    let s = idleSeconds%60;

    if(m < 10) m = "0" + m;
    if(s < 10) s = "0" + s;

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime){

    function toSeconds(time){
        let p = time.split(":");
        return parseInt(p[0])*3600 + parseInt(p[1])*60 + parseInt(p[2]);
    }

    let shift = toSeconds(shiftDuration);
    let idle = toSeconds(idleTime);

    let active = shift - idle;

    let h = Math.floor(active/3600);
    let m = Math.floor((active%3600)/60);
    let s = active%60;

    if(m < 10) m = "0" + m;
    if(s < 10) s = "0" + s;

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime){

    let parts = date.split("-");
    let month = parseInt(parts[1]);
    let day = parseInt(parts[2]);

    function sec(t){
        let p = t.split(":");
        return parseInt(p[0])*3600 + parseInt(p[1])*60 + parseInt(p[2]);
    }

    let active = sec(activeTime);

    let quota;

    if(month === 4 && day >= 10 && day <= 30){
        quota = 6*3600;
    }else{
        quota = 8*3600 + 24*60;
    }

    if(active >= quota){
        return true;
    }

    return f


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj){

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === shiftObj.driverID && r[2] === shiftObj.date){
            return {};
        }
    }

    let duration = getShiftDuration(shiftObj.startTime,shiftObj.endTime);
    let idle = getIdleTime(shiftObj.startTime,shiftObj.endTime);
    let active = getActiveTime(duration,idle);
    let quota = metQuota(shiftObj.date,active);

    let row = shiftObj.driverID + "," +
              shiftObj.driverName + "," +
              shiftObj.date + "," +
              shiftObj.startTime + "," +
              shiftObj.endTime + "," +
              duration + "," +
              idle + "," +
              active + "," +
              quota + "," +
              false;

    if(rows[rows.length-1] === ""){
        rows.pop();
    }

    rows.push(row);

    fs.writeFileSync(textFile,rows.join("\n"));

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: duration,
        idleTime: idle,
        activeTime: active,
        metQuota: quota,
        hasBonus: false
    };
}


// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue){

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID && r[2] === date){

            r[9] = newValue.toString();

            rows[i] = r.join(",");
        }
    }

    fs.writeFileSync(textFile,rows.join("\n"));
}


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month){

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let count = 0;
    let exists = false;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            exists = true;

            let m = r[2].split("-")[1];

            if(parseInt(m) === parseInt(month) && r[9] === "true"){
                count = count + 1;
            }
        }
    }

    if(exists === false){
        return -1;
    }

    return count;
}


// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month){

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let total = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            let m = r[2].split("-")[1];

            if(parseInt(m) === parseInt(month)){

                let t = r[7].split(":");

                total = total +
                        parseInt(t[0])*3600 +
                        parseInt(t[1])*60 +
                        parseInt(t[2]);
            }
        }
    }

    let h = Math.floor(total/3600);
    let m = Math.floor((total%3600)/60);
    let s = total%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month){

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let total = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            let parts = r[2].split("-");
            let m = parseInt(parts[1]);
            let d = parseInt(parts[2]);

            if(m === parseInt(month)){

                if(d >= 10 && d <= 30){
                    total = total + 6*3600;
                }else{
                    total = total + (8*3600 + 24*60);
                }
            }
        }
    }

    total = total - (bonusCount * 2 * 3600);

    let h = Math.floor(total/3600);
    let m = Math.floor((total%3600)/60);
    let s = total%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile){

    let data = fs.readFileSync(rateFile,"utf8");
    let rows = data.split("\n");

    let basePay = 0;
    let tier = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){
            basePay = parseInt(r[2]);
            tier = parseInt(r[3]);
        }
    }

    function toSec(t){
        let p = t.split(":");
        return parseInt(p[0])*3600 +
               parseInt(p[1])*60 +
               parseInt(p[2]);
    }

    let actual = toSec(actualHours);
    let required = toSec(requiredHours);

    if(actual >= required){
        return basePay;
    }

    let missing = required - actual;

    let allowed = 0;

    if(tier === 1) allowed = 50;
    if(tier === 2) allowed = 20;
    if(tier === 3) allowed = 10;
    if(tier === 4) allowed = 3;

    missing = missing/3600 - allowed;

    if(missing < 0) missing = 0;

    missing = Math.floor(missing);

    let rate = Math.floor(basePay/185);

    let deduction = missing * rate;

    return basePay - deduction;
}


module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
