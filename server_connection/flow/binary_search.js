function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export async function binary_search({array, target}) {
    const time = timeToMinutes(target);
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const start = timeToMinutes(array[mid].start);
        const end = timeToMinutes(array[mid].end);
        if (time >= start && time <= end) {
            return mid;
        } else if (end < time) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return -1;
}