import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid2,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';

const App: React.FC = () => {
  const [patentId, setPatentId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [patentIdError, setPatentIdError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  // Validate inputs in real-time
  const validateInputs = () => {
    let isValid = true;
    setPatentIdError('');
    setCompanyNameError('');

    if (!patentId.trim()) {
      setPatentIdError('Patent ID is required');
      isValid = false;
    } else if (!patentId.match(/^[A-Z0-9-]+$/)) {
      setPatentIdError('Patent ID should contain only uppercase letters, numbers, and hyphens');
      isValid = false;
    }

    if (!companyName.trim()) {
      setCompanyNameError('Company name is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        patent_id: patentId,
        company_name: companyName,
      });
      setResult(response.data);
    } catch (err) {
      setError('Error analyzing infringement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPatentId('');
    setCompanyName('');
    setResult(null);
    setError('');
    setPatentIdError('');
    setCompanyNameError('');
    setExpandedProduct(null);
  };

  const toggleExpand = (index: number) => {
    setExpandedProduct(expandedProduct === index ? null : index);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        Patent Infringement Check
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Patent ID"
              value={patentId}
              onChange={(e) => setPatentId(e.target.value)}
              error={!!patentIdError}
              helperText={patentIdError}
              placeholder="e.g., US7763459B2"
              variant="outlined"
            />
          </Grid2>
          <Grid2  size={12}>
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={!!companyNameError}
              helperText={companyNameError}
              placeholder="e.g., Apple Inc."
              variant="outlined"
            />
          </Grid2>
          <Grid2 size={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ flex: 1 }}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
                sx={{ flex: 1 }}
              >
                Reset
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Result
          </Typography>
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                <strong>Patent ID:</strong> {result.patent_id}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {result.company_name}
              </Typography>
              <Typography variant="body1">
                <strong>Analysis Date:</strong> {result.analysis_date}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Top Infringing Products:
              </Typography>
              {result.top_infringing_products.map((product: any, index: number) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        <strong>{product.product_name}</strong> ({product.infringement_likelihood})
                      </Typography>
                      <IconButton onClick={() => toggleExpand(index)}>
                        {expandedProduct === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedProduct === index}>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {product.explanation}
                      </Typography>
                      {product.specific_features.length > 0 ? (
                        <List dense>
                          {product.specific_features.map((feature: string, i: number) => (
                            <ListItem key={i}>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          No specific features identified.
                        </Typography>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Overall Risk:</strong>{' '}
                <span
                  style={{
                    color:
                      result.overall_risk_assessment.includes('High')
                        ? 'red'
                        : result.overall_risk_assessment.includes('Moderate')
                        ? 'orange'
                        : 'green',
                    fontWeight: 'bold',
                  }}
                >
                  {result.overall_risk_assessment}
                </span>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default App;