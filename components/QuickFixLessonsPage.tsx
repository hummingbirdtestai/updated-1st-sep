@@ .. @@
   const chartData = [
-    { name: 'Before', accuracy: fix.pre_accuracy, fill: '#ef4444' },
-    { name: 'After', accuracy: fix.post_accuracy, fill: '#10b981' }
+    { name: 'Before', accuracy: Number.isFinite(fix.pre_accuracy) ? fix.pre_accuracy : 0, fill: '#ef4444' },
+    { name: 'After', accuracy: Number.isFinite(fix.post_accuracy) ? fix.post_accuracy : 0, fill: '#10b981' }
   ];

@@ .. @@
           {/* Mini Bar Chart */}
           <View className="mb-4">
             <Text className="text-slate-300 font-semibold text-sm mb-2">Accuracy Improvement</Text>
-            <View style={{ width: '100%', height: 80 }}>
-              <ResponsiveContainer width="100%" height="100%">
-                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
-                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
-                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
-                  <Tooltip 
-                    contentStyle={{ 
-                      backgroundColor: '#1e293b', 
-                      border: '1px solid #475569',
-                      borderRadius: '8px',
-                      color: '#f1f5f9'
-                    }}
-                  />
-                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} />
-                </BarChart>
-              </ResponsiveContainer>
-            </View>
+            {chartData.every(d => Number.isFinite(d.accuracy)) ? (
+              <View style={{ width: '100%', height: 80 }}>
+                <ResponsiveContainer width="100%" height="100%">
+                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
+                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
+                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
+                    <Tooltip 
+                      contentStyle={{ 
+                        backgroundColor: '#1e293b', 
+                        border: '1px solid #475569',
+                        borderRadius: '8px',
+                        color: '#f1f5f9'
+                      }}
+                    />
+                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} />
+                  </BarChart>
+                </ResponsiveContainer>
+              </View>
+            ) : (
+              <View className="bg-slate-700/40 rounded-lg p-4 items-center">
+                <Text className="text-slate-400 text-sm">Chart data unavailable</Text>
+              </View>
+            )}