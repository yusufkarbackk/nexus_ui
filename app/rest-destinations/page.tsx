import { RestDestinationForm } from './components/RestDestinationForm';

export const metadata = {
    title: 'REST Destination - Nexus Gateway',
    description: 'Configure REST API endpoint',
};

export default function RestDestinationPage() {
    return <RestDestinationForm />;
}
