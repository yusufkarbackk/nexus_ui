import { RestDestinationList } from './components/RestDestinationList';

export const metadata = {
    title: 'REST Destinations - Nexus Gateway',
    description: 'Manage your REST API endpoints',
};

export default function RestDestinationListPage() {
    return <RestDestinationList />;
}
