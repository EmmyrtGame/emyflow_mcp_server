import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Users,
    CalendarCheck,
    MessageSquare,
    Phone,
    UserPlus,
    TrendingUp,
    Activity
} from 'lucide-react';
import { analyticsService, clientService } from '@/services/api';

interface StatsData {
    lifetime: {
        leads: number;
        appointments: number;
        messages: number;
        handoffs: number;
        newConversations: number;
    };
    monthly: {
        leads: number;
        appointments: number;
        messages: number;
        handoffs: number;
        newConversations: number;
        month: string;
    };
}

interface EventData {
    id: string;
    eventType: string;
    phone: string | null;
    metadata: any;
    createdAt: string;
}

interface ClientInfo {
    id: string;
    name: string;
    slug: string;
}

const eventTypeColors: Record<string, string> = {
    LEAD: 'bg-green-500',
    APPOINTMENT: 'bg-blue-500',
    MESSAGE: 'bg-gray-500',
    HANDOFF: 'bg-orange-500',
    NEW_CONVERSATION: 'bg-purple-500',
};

const eventTypeLabels: Record<string, string> = {
    LEAD: 'Lead',
    APPOINTMENT: 'Cita',
    MESSAGE: 'Mensaje',
    HANDOFF: 'Handoff',
    NEW_CONVERSATION: 'Nueva Conversación',
};

export default function ClientAnalytics() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<ClientInfo | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [recentEvents, setRecentEvents] = useState<EventData[]>([]);
    const [viewMode, setViewMode] = useState<'monthly' | 'lifetime'>('monthly');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [clientData, analyticsData] = await Promise.all([
                clientService.getOne(id!),
                analyticsService.getStats(id!),
            ]);
            setClient(clientData);
            setStats(analyticsData.stats);
            setRecentEvents(analyticsData.recentEvents || []);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatsForView = () => {
        if (!stats) return null;
        return viewMode === 'monthly' ? stats.monthly : stats.lifetime;
    };

    const currentStats = getStatsForView();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Analytics: {client?.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Rendimiento y métricas de {client?.slug}
                    </p>
                </div>
            </div>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'monthly' | 'lifetime')}>
                <TabsList>
                    <TabsTrigger value="monthly">
                        <Activity className="h-4 w-4 mr-2" />
                        Mensual ({stats?.monthly.month})
                    </TabsTrigger>
                    <TabsTrigger value="lifetime">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Total Histórico
                    </TabsTrigger>
                </TabsList>

                {/* Stats Cards */}
                <TabsContent value={viewMode} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Leads */}
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700">Leads</CardTitle>
                                <Users className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-700">
                                    {currentStats?.leads ?? 0}
                                </div>
                                <p className="text-xs text-green-600/70 mt-1">
                                    Eventos Lead enviados
                                </p>
                            </CardContent>
                        </Card>

                        {/* Appointments */}
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700">Citas</CardTitle>
                                <CalendarCheck className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-700">
                                    {currentStats?.appointments ?? 0}
                                </div>
                                <p className="text-xs text-blue-600/70 mt-1">
                                    Citas agendadas
                                </p>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">Mensajes</CardTitle>
                                <MessageSquare className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-700">
                                    {currentStats?.messages ?? 0}
                                </div>
                                <p className="text-xs text-gray-600/70 mt-1">
                                    Mensajes recibidos
                                </p>
                            </CardContent>
                        </Card>

                        {/* Handoffs */}
                        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-700">Handoffs</CardTitle>
                                <Phone className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-orange-700">
                                    {currentStats?.handoffs ?? 0}
                                </div>
                                <p className="text-xs text-orange-600/70 mt-1">
                                    Transferencias a humano
                                </p>
                            </CardContent>
                        </Card>

                        {/* New Conversations */}
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-700">Nuevos</CardTitle>
                                <UserPlus className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-700">
                                    {currentStats?.newConversations ?? 0}
                                </div>
                                <p className="text-xs text-purple-600/70 mt-1">
                                    Conversaciones nuevas
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Recent Events Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Eventos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentEvents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                        No hay eventos registrados aún
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <Badge className={`${eventTypeColors[event.eventType]} text-white`}>
                                                {eventTypeLabels[event.eventType] || event.eventType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {event.phone || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(event.createdAt).toLocaleString('es-MX', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
