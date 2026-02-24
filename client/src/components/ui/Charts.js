import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ChartContainer = styled(Paper)(({ theme, customHeight }) => ({
  padding: theme.spacing(2, 3, 3, 3),
  borderRadius: 16,
  height: customHeight || 400,
  minHeight: 300,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    height: customHeight ? customHeight - 50 : 350,
    minHeight: 280,
  },
  [theme.breakpoints.down('sm')]: {
    height: customHeight ? customHeight - 100 : 300,
    minHeight: 250,
  },
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  const theme = useTheme();
  
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {label && (
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {labelFormatter ? labelFormatter(label) : label}
        </Typography>
      )}
      {payload.map((entry, index) => (
        <Typography
          key={index}
          variant="body2"
          sx={{ color: entry.color }}
        >
          {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </Typography>
      ))}
    </Paper>
  );
};

// Area Chart Component
export const AreaChartComponent = ({ 
  data, 
  title, 
  xKey, 
  yKey, 
  color = '#667eea',
  height = 400,
  labelFormatter,
  valueFormatter,
}) => {
  const theme = useTheme();
  
  return (
    <ChartContainer elevation={2} customHeight={height}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box flexGrow={1}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey={xKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <Tooltip 
              content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
            />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${yKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
};

// Bar Chart Component
export const BarChartComponent = ({ 
  data, 
  title, 
  xKey, 
  yKey, 
  color = '#2e7d32',
  height = 400,
  labelFormatter,
  valueFormatter,
}) => {
  const theme = useTheme();
  
  return (
    <ChartContainer elevation={2} customHeight={height}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box flexGrow={1}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <XAxis 
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <Tooltip 
              content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
            />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
};

// Line Chart Component
export const LineChartComponent = ({ 
  data, 
  title, 
  xKey, 
  yKey, 
  color = '#ff9800',
  height = 300,
  labelFormatter,
  valueFormatter,
}) => {
  const theme = useTheme();
  
  return (
    <ChartContainer elevation={2}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box flexGrow={1}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <Tooltip 
              content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
            />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
};

// Pie Chart Component
export const PieChartComponent = ({ 
  data, 
  title, 
  nameKey = 'name', 
  valueKey = 'value',
  colors = ['#667eea', '#2e7d32', '#ff9800', '#d32f2f'],
  height = 400,
  valueFormatter,
}) => {
  const theme = useTheme();

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer elevation={2} customHeight={height}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box flexGrow={1}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={Math.min(80, (height - 150) / 4)}
              fill="#8884d8"
              dataKey={valueKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: 10,
                fontSize: 14,
                color: theme.palette.text.primary,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
};

// Multi-line Chart Component
export const MultiLineChartComponent = ({ 
  data, 
  title, 
  xKey, 
  lines = [], // [{ key: 'line1', color: '#667eea', name: 'Line 1' }]
  height = 300,
  labelFormatter,
  valueFormatter,
}) => {
  const theme = useTheme();
  
  return (
    <ChartContainer elevation={2}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box flexGrow={1}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <Tooltip 
              content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
            />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                name={line.name}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </ChartContainer>
  );
};

export default {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  MultiLineChartComponent,
};