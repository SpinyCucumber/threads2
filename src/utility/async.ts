export function sleep(duration): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}