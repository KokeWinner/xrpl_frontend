// javascript port of: https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data/48895639#48895639

/*
p = [1 1 1.1 1 0.9 1 1 1.1 1 0.9 1 1.1 1 1 0.9 1 1 1.1 1 1 1 1 1.1 0.9 1 1.1 1 1 0.9, ...
    1 1.1 1 1 1.1 1 0.8 0.9 1 1.2 0.9 1 1 1.1 1.2 1 1.5 1 3 2 5 3 2 1 1 1 0.9 1 1, ... 
    3 2.6 4 3 3.2 2 1 1 0.8 4 4 2 2.5 1 1 1];
*/

// https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data
/*
It is based on the principle of dispersion: if a new datapoint is a given x number of standard deviations away from some moving mean, the algorithm signals (also called z-score).
The algorithm is very robust because it constructs a separate moving mean and deviation, such that signals do not corrupt the threshold.
Future signals are therefore identified with approximately the same accuracy, regardless of the amount of previous signals.
The algorithm takes 3 inputs:
    lag = the lag of the moving window,
    threshold = the z-score at which the algorithm signals
    influence = the influence (between 0 and 1) of new signals on the mean and standard deviation.
For example, a lag of 5 will use the last 5 observations to smooth the data.
A threshold of 3.5 will signal if a datapoint is 3.5 standard deviations away from the moving mean.
And an influence of 0.5 gives signals half of the influence that normal datapoints have.
Likewise, an influence of 0 ignores signals completely for recalculating the new threshold.
An influence of 0 is therefore the most robust option (but assumes stationarity); putting the influence option at 1 is least robust.
For non-stationary data, the influence option should therefore be put somewhere between 0 and 1.
*/

function sum(a) {
    return a.reduce((acc, val) => acc + val)
}

function mean(a) {
    return sum(a) / a.length
}

function stddev(arr) {
    const arr_mean = mean(arr)
    const r = function(acc, val) {
        return acc + ((val - arr_mean) * (val - arr_mean))
    }
    return Math.sqrt(arr.reduce(r, 0.0) / arr.length)
}

function smoothed_z_score(y, params) {
    var p = params || {}
    // init cooefficients
    const lag = p.lag || 5
    const threshold = p.threshold || 3.5
    const influence = p.influence || 0.5

    if (y === undefined || y.length < lag + 2) {
        throw ` ## y data array is too short(${y.length}) for given lag of ${lag}`
    }
    //console.log(`lag, threshold, influence: ${lag}, ${threshold}, ${influence}`)

    // init variables
    var signals = Array(y.length).fill(0)
    var filteredY = y.slice(0)
    const lead_in = y.slice(0, lag)
    //console.log("1: " + lead_in.toString())

    var avgFilter = []
    avgFilter[lag - 1] = mean(lead_in)
    var stdFilter = []
    stdFilter[lag - 1] = stddev(lead_in)
    //console.log("2: " + stdFilter.toString())

    for (var i = lag; i < y.length; i++) {
        //console.log(`${y[i]}, ${avgFilter[i-1]}, ${threshold}, ${stdFilter[i-1]}`)
        if (Math.abs(y[i] - avgFilter[i - 1]) > (threshold * stdFilter[i - 1])) {
            if (y[i] > avgFilter[i - 1]) {
                signals[i] = +1 // positive signal
            } else {
                signals[i] = -1 // negative signal
            }
            // make influence lower
            filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
        } else {
            signals[i] = 0 // no signal
            filteredY[i] = y[i]
        }

        // adjust the filters
        const y_lag = filteredY.slice(i - lag, i)
        avgFilter[i] = mean(y_lag)
        stdFilter[i] = stddev(y_lag)
    }

    return signals
}

module.exports = smoothed_z_score