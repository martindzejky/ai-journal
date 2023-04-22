import { format } from 'date-fns';

export default function systemCurrentDate() {
    return `Current date: ${format(new Date(), 'yyyy-MM-dd')}, ${format(new Date(), 'EEEE')}.
`;
}
