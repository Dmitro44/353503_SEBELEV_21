import { formatInTimeZone } from 'date-fns-tz';

function DateDisplay({ date, label, showTime = true }) {
    if (!date) return null;

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatString = showTime ? 'dd.MM.yyyy HH:mm:ss' : 'dd.MM.yyyy';

    const localTime = formatInTimeZone(new Date(date), userTimeZone, formatString);

    return (
        <div className="date-display">
            <p>
                <label><strong>{label}</strong></label>
                <span title={`Часовой пояс: ${userTimeZone}`}> {localTime}</span>
            </p>
        </div>
    );
}

export default DateDisplay;
