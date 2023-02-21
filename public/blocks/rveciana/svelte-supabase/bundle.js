
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$3() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$3;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$3,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$3;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
    class Adder {
      constructor() {
        this._partials = new Float64Array(32);
        this._n = 0;
      }
      add(x) {
        const p = this._partials;
        let i = 0;
        for (let j = 0; j < this._n && j < 32; j++) {
          const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
          if (lo) p[i++] = lo;
          x = hi;
        }
        p[i] = x;
        this._n = i + 1;
        return this;
      }
      valueOf() {
        const p = this._partials;
        let n = this._n, x, y, lo, hi = 0;
        if (n > 0) {
          hi = p[--n];
          while (n > 0) {
            x = hi;
            y = p[--n];
            hi = x + y;
            lo = y - (hi - x);
            if (lo) break;
          }
          if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
            y = lo * 2;
            x = hi + y;
            if (y == x - hi) hi = x;
          }
        }
        return hi;
      }
    }

    function* flatten(arrays) {
      for (const array of arrays) {
        yield* array;
      }
    }

    function merge(arrays) {
      return Array.from(flatten(arrays));
    }

    var epsilon = 1e-6;
    var epsilon2 = 1e-12;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var quarterPi = pi / 4;
    var tau = pi * 2;

    var degrees = 180 / pi;
    var radians = pi / 180;

    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var sin = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt = Math.sqrt;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$2() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$2,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    function longitude(point) {
      return abs(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin(phi),
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;

      var sum = new Adder();

      if (sinPhi === 1) phi = halfPi + epsilon;
      else if (sinPhi === -1) phi = -halfPi - epsilon;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi : -pi,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi) < epsilon) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
            if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
            if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon
          ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
              - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi, phi);
        stream.point(0, phi);
        stream.point(pi, phi);
        stream.point(pi, 0);
        stream.point(pi, -phi);
        stream.point(0, -phi);
        stream.point(-pi, -phi);
        stream.point(-pi, 0);
        stream.point(-pi, phi);
      } else if (abs(from[0] - to[0]) > epsilon) {
        var lambda = from[0] < to[0] ? pi : -pi;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs(delta - pi) < epsilon,
            meridian = polar || delta < epsilon;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
            : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
            : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    var identity$1 = x => x;

    var areaSum = new Adder(),
        areaRingSum = new Adder(),
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var areaStream = {
      point: noop$2,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$2;
        areaSum.add(abs(areaRingSum));
        areaRingSum = new Adder();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum = new Adder();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0$3 * x - x0$3 * y);
      x0$3 = x, y0$3 = y;
    }

    function areaRingEnd() {
      areaPoint(x00$2, y00$2);
    }

    var x0$2 = Infinity,
        y0$2 = x0$2,
        x1 = -x0$2,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: noop$2,
      polygonEnd: noop$2,
      result: function() {
        var bounds = [[x0$2, y0$2], [x1, y1]];
        x1 = y1 = -(y0$2 = x0$2 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$2) x0$2 = x;
      if (x > x1) x1 = x;
      if (y < y0$2) y0$2 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$1,
        y0$1;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
      X1 += z * (x0$1 + x) / 2;
      Y1 += z * (y0$1 + y) / 2;
      Z1 += z;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$1,
          dy = y - y0$1,
          z = sqrt(dx * dx + dy * dy);

      X1 += z * (x0$1 + x) / 2;
      Y1 += z * (y0$1 + y) / 2;
      Z1 += z;

      z = y0$1 * x - x0$1 * y;
      X2 += z * (x0$1 + x);
      Y2 += z * (y0$1 + y);
      Z2 += z * 3;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau);
            break;
          }
        }
      },
      result: noop$2
    };

    var lengthSum = new Adder(),
        lengthRing,
        x00,
        y00,
        x0,
        y0;

    var lengthStream = {
      point: noop$2,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00, y00);
        lengthStream.point = noop$2;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum = new Adder();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function lengthPoint(x, y) {
      x0 -= x, y0 -= y;
      lengthSum.add(sqrt(x0 * x0 + y0 * y0));
      x0 = x, y0 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function geoPath(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$1) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
      var cosAlpha = cos(alpha),
          sinAlpha = sin(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projection(project) {
      return projectionMutator(function() { return project; })();
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$1, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees, point[1] * degrees];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$1) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    var A1 = 1.340264,
        A2 = -0.081106,
        A3 = 0.000893,
        A4 = 0.003796,
        M = sqrt(3) / 2,
        iterations = 12;

    function equalEarthRaw(lambda, phi) {
      var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
      return [
        lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
        l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
      ];
    }

    equalEarthRaw.invert = function(x, y) {
      var l = y, l2 = l * l, l6 = l2 * l2 * l2;
      for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
        fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
        fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
        l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
        if (abs(delta) < epsilon2) break;
      }
      return [
        M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
        asin(sin(l) / M)
      ];
    };

    function geoEqualEarth() {
      return projection(equalEarthRaw)
          .scale(177.158);
    }

    function identity(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    /* src\Map.svelte generated by Svelte v3.38.3 */
    const file$1 = "src\\Map.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (36:4) {#each points.filter(d=>d.geom) as point}
    function create_each_block$1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "r", "10");
    			attr_dev(circle, "cx", circle_cx_value = /*projection*/ ctx[2](/*point*/ ctx[4].geom.coordinates)[0]);
    			attr_dev(circle, "cy", circle_cy_value = /*projection*/ ctx[2](/*point*/ ctx[4].geom.coordinates)[1]);
    			add_location(circle, file$1, 36, 8, 1070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*points*/ 1 && circle_cx_value !== (circle_cx_value = /*projection*/ ctx[2](/*point*/ ctx[4].geom.coordinates)[0])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*points*/ 1 && circle_cy_value !== (circle_cy_value = /*projection*/ ctx[2](/*point*/ ctx[4].geom.coordinates)[1])) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:4) {#each points.filter(d=>d.geom) as point}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svg;
    	let path_1;
    	let each_value = /*points*/ ctx[0].filter(func);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path_1, "d", /*data*/ ctx[1]);
    			attr_dev(path_1, "class", "border svelte-1x0lp3d");
    			add_location(path_1, file$1, 34, 4, 981);
    			attr_dev(svg, "width", "960");
    			attr_dev(svg, "height", "500");
    			attr_dev(svg, "class", "svelte-1x0lp3d");
    			add_location(svg, file$1, 33, 2, 945);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 2) {
    				attr_dev(path_1, "d", /*data*/ ctx[1]);
    			}

    			if (dirty & /*projection, points*/ 5) {
    				each_value = /*points*/ ctx[0].filter(func);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = d => d.geom;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	let { points } = $$props;
    	let data;
    	const projection = geoEqualEarth();
    	const path = geoPath().projection(projection);

    	onMount(async function () {
    		const response = await fetch("https://gist.githubusercontent.com/rveciana/502db152b70cddfd554e9d48ee23e279/raw/cc51c1b46199994b123271c629541d417f2f7d86/world-110m.json");
    		const json = await response.json();
    		const land = feature(json, json.objects.land);
    		$$invalidate(1, data = path(land));
    	});

    	const writable_props = ["points"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("points" in $$props) $$invalidate(0, points = $$props.points);
    	};

    	$$self.$capture_state = () => ({
    		geoEqualEarth,
    		geoPath,
    		onMount,
    		feature,
    		points,
    		data,
    		projection,
    		path
    	});

    	$$self.$inject_state = $$props => {
    		if ("points" in $$props) $$invalidate(0, points = $$props.points);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [points, data, projection];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { points: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*points*/ ctx[0] === undefined && !("points" in props)) {
    			console.warn("<Map> was created without expected prop 'points'");
    		}
    	}

    	get points() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set points(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // constants.ts
    const DEFAULT_HEADERS$1 = {};

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var browserPonyfill = createCommonjsModule(function (module, exports) {
    var global = typeof self !== 'undefined' ? self : commonjsGlobal;
    var __self__ = (function () {
    function F() {
    this.fetch = false;
    this.DOMException = global.DOMException;
    }
    F.prototype = global;
    return new F();
    })();
    (function(self) {

    ((function (exports) {

      var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob:
          'FileReader' in self &&
          'Blob' in self &&
          (function() {
            try {
              new Blob();
              return true
            } catch (e) {
              return false
            }
          })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
      };

      function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj)
      }

      if (support.arrayBuffer) {
        var viewClasses = [
          '[object Int8Array]',
          '[object Uint8Array]',
          '[object Uint8ClampedArray]',
          '[object Int16Array]',
          '[object Uint16Array]',
          '[object Int32Array]',
          '[object Uint32Array]',
          '[object Float32Array]',
          '[object Float64Array]'
        ];

        var isArrayBufferView =
          ArrayBuffer.isView ||
          function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
          };
      }

      function normalizeName(name) {
        if (typeof name !== 'string') {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
          throw new TypeError('Invalid character in header field name')
        }
        return name.toLowerCase()
      }

      function normalizeValue(value) {
        if (typeof value !== 'string') {
          value = String(value);
        }
        return value
      }

      // Build a destructive iterator for the value list
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return {done: value === undefined, value: value}
          }
        };

        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator
          };
        }

        return iterator
      }

      function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header) {
            this.append(header[0], header[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }

      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ', ' + value : value;
      };

      Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)];
      };

      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null
      };

      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name))
      };

      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };

      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };

      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push(name);
        });
        return iteratorFor(items)
      };

      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
          items.push(value);
        });
        return iteratorFor(items)
      };

      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push([name, value]);
        });
        return iteratorFor(items)
      };

      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError('Already read'))
        }
        body.bodyUsed = true;
      }

      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        })
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise
      }

      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise
      }

      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);

        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('')
      }

      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0)
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer
        }
      }

      function Body() {
        this.bodyUsed = false;

        this._initBody = function(body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = '';
          } else if (typeof body === 'string') {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            // IE 10-11 can't handle a DataView body.
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            this._bodyText = body = Object.prototype.toString.call(body);
          }

          if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
              this.headers.set('content-type', 'text/plain;charset=UTF-8');
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set('content-type', this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
          }
        };

        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected
            }

            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as blob')
            } else {
              return Promise.resolve(new Blob([this._bodyText]))
            }
          };

          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
              return this.blob().then(readBlobAsArrayBuffer)
            }
          };
        }

        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
          } else {
            return Promise.resolve(this._bodyText)
          }
        };

        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode)
          };
        }

        this.json = function() {
          return this.text().then(JSON.parse)
        };

        return this
      }

      // HTTP methods whose capitalization should be normalized
      var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;

        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError('Already read')
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          this.signal = input.signal;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }

        this.credentials = options.credentials || this.credentials || 'same-origin';
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
          throw new TypeError('Body not allowed for GET or HEAD requests')
        }
        this._initBody(body);
      }

      Request.prototype.clone = function() {
        return new Request(this, {body: this._bodyInit})
      };

      function decode(body) {
        var form = new FormData();
        body
          .trim()
          .split('&')
          .forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split('=');
              var name = split.shift().replace(/\+/g, ' ');
              var value = split.join('=').replace(/\+/g, ' ');
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
        return form
      }

      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
          var parts = line.split(':');
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(':').trim();
            headers.append(key, value);
          }
        });
        return headers
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }

        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
      }

      Body.call(Response.prototype);

      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        })
      };

      Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ''});
        response.type = 'error';
        return response
      };

      var redirectStatuses = [301, 302, 303, 307, 308];

      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError('Invalid status code')
        }

        return new Response(null, {status: status, headers: {location: url}})
      };

      exports.DOMException = self.DOMException;
      try {
        new exports.DOMException();
      } catch (err) {
        exports.DOMException = function(message, name) {
          this.message = message;
          this.name = name;
          var error = Error(message);
          this.stack = error.stack;
        };
        exports.DOMException.prototype = Object.create(Error.prototype);
        exports.DOMException.prototype.constructor = exports.DOMException;
      }

      function fetch(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);

          if (request.signal && request.signal.aborted) {
            return reject(new exports.DOMException('Aborted', 'AbortError'))
          }

          var xhr = new XMLHttpRequest();

          function abortXhr() {
            xhr.abort();
          }

          xhr.onload = function() {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || '')
            };
            options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };

          xhr.onerror = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.ontimeout = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.onabort = function() {
            reject(new exports.DOMException('Aborted', 'AbortError'));
          };

          xhr.open(request.method, request.url, true);

          if (request.credentials === 'include') {
            xhr.withCredentials = true;
          } else if (request.credentials === 'omit') {
            xhr.withCredentials = false;
          }

          if ('responseType' in xhr && support.blob) {
            xhr.responseType = 'blob';
          }

          request.headers.forEach(function(value, name) {
            xhr.setRequestHeader(name, value);
          });

          if (request.signal) {
            request.signal.addEventListener('abort', abortXhr);

            xhr.onreadystatechange = function() {
              // DONE (success or failure)
              if (xhr.readyState === 4) {
                request.signal.removeEventListener('abort', abortXhr);
              }
            };
          }

          xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        })
      }

      fetch.polyfill = true;

      if (!self.fetch) {
        self.fetch = fetch;
        self.Headers = Headers;
        self.Request = Request;
        self.Response = Response;
      }

      exports.Headers = Headers;
      exports.Request = Request;
      exports.Response = Response;
      exports.fetch = fetch;

      Object.defineProperty(exports, '__esModule', { value: true });

      return exports;

    })({}));
    })(__self__);
    __self__.fetch.ponyfill = true;
    // Remove "polyfill" property added by whatwg-fetch
    delete __self__.fetch.polyfill;
    // Choose between native implementation (global) or custom implementation (__self__)
    // var ctx = global.fetch ? global : __self__;
    var ctx = __self__; // this line disable service worker support temporarily
    exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
    exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
    exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module.exports = exports;
    });

    var fetch$1 = /*@__PURE__*/getDefaultExportFromCjs(browserPonyfill);

    var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError$1 = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage$1(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams$1 = (method, options, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'text/plain;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return params;
    };
    function _handleRequest$1(method, url, options, body) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetch$1(url, _getRequestParams$1(method, options, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError$1(error, reject));
            });
        });
    }
    function get$1(url, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1('GET', url, options);
        });
    }
    function post$1(url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1('POST', url, options, body);
        });
    }
    function put$1(url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1('PUT', url, options, body);
        });
    }
    function remove$1(url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1('DELETE', url, options, body);
        });
    }

    const GOTRUE_URL = 'http://localhost:9999';
    const DEFAULT_HEADERS = {};
    const STORAGE_KEY = 'supabase.auth.token';
    const COOKIE_OPTIONS = {
        name: 'sb:token',
        lifetime: 60 * 60 * 8,
        domain: '',
        path: '/',
        sameSite: 'lax',
    };

    /**
     * Serialize data into a cookie header.
     */
    function serialize(name, val, options) {
        const opt = options || {};
        const enc = encodeURIComponent;
        const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        if (typeof enc !== 'function') {
            throw new TypeError('option encode is invalid');
        }
        if (!fieldContentRegExp.test(name)) {
            throw new TypeError('argument name is invalid');
        }
        const value = enc(val);
        if (value && !fieldContentRegExp.test(value)) {
            throw new TypeError('argument val is invalid');
        }
        let str = name + '=' + value;
        if (null != opt.maxAge) {
            const maxAge = opt.maxAge - 0;
            if (isNaN(maxAge) || !isFinite(maxAge)) {
                throw new TypeError('option maxAge is invalid');
            }
            str += '; Max-Age=' + Math.floor(maxAge);
        }
        if (opt.domain) {
            if (!fieldContentRegExp.test(opt.domain)) {
                throw new TypeError('option domain is invalid');
            }
            str += '; Domain=' + opt.domain;
        }
        if (opt.path) {
            if (!fieldContentRegExp.test(opt.path)) {
                throw new TypeError('option path is invalid');
            }
            str += '; Path=' + opt.path;
        }
        if (opt.expires) {
            if (typeof opt.expires.toUTCString !== 'function') {
                throw new TypeError('option expires is invalid');
            }
            str += '; Expires=' + opt.expires.toUTCString();
        }
        if (opt.httpOnly) {
            str += '; HttpOnly';
        }
        if (opt.secure) {
            str += '; Secure';
        }
        if (opt.sameSite) {
            const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
            switch (sameSite) {
                case 'lax':
                    str += '; SameSite=Lax';
                    break;
                case 'strict':
                    str += '; SameSite=Strict';
                    break;
                case 'none':
                    str += '; SameSite=None';
                    break;
                default:
                    throw new TypeError('option sameSite is invalid');
            }
        }
        return str;
    }
    /**
     * Based on the environment and the request we know if a secure cookie can be set.
     */
    function isSecureEnvironment(req) {
        if (!req || !req.headers || !req.headers.host) {
            throw new Error('The "host" request header is not available');
        }
        const host = (req.headers.host.indexOf(':') > -1 && req.headers.host.split(':')[0]) || req.headers.host;
        if (['localhost', '127.0.0.1'].indexOf(host) > -1 || host.endsWith('.local')) {
            return false;
        }
        return true;
    }
    /**
     * Serialize a cookie to a string.
     */
    function serializeCookie(cookie, secure) {
        var _a, _b, _c;
        return serialize(cookie.name, cookie.value, {
            maxAge: cookie.maxAge,
            expires: new Date(Date.now() + cookie.maxAge * 1000),
            httpOnly: true,
            secure,
            path: (_a = cookie.path) !== null && _a !== void 0 ? _a : '/',
            domain: (_b = cookie.domain) !== null && _b !== void 0 ? _b : '',
            sameSite: (_c = cookie.sameSite) !== null && _c !== void 0 ? _c : 'lax',
        });
    }
    /**
     * Set one or more cookies.
     */
    function setCookies(req, res, cookies) {
        const strCookies = cookies.map((c) => serializeCookie(c, isSecureEnvironment(req)));
        const previousCookies = res.getHeader('Set-Cookie');
        if (previousCookies) {
            if (previousCookies instanceof Array) {
                Array.prototype.push.apply(strCookies, previousCookies);
            }
            else if (typeof previousCookies === 'string') {
                strCookies.push(previousCookies);
            }
        }
        res.setHeader('Set-Cookie', strCookies);
    }
    /**
     * Set one or more cookies.
     */
    function setCookie(req, res, cookie) {
        setCookies(req, res, [cookie]);
    }
    function deleteCookie(req, res, name) {
        setCookie(req, res, {
            name,
            value: '',
            maxAge: -1,
        });
    }

    function expiresAt(expiresIn) {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow + expiresIn;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    const isBrowser$1 = () => typeof window !== 'undefined';
    function getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    class LocalStorage {
        constructor(localStorage) {
            this.localStorage = localStorage || globalThis.localStorage;
        }
        clear() {
            return this.localStorage.clear();
        }
        key(index) {
            return this.localStorage.key(index);
        }
        setItem(key, value) {
            return this.localStorage.setItem(key, value);
        }
        getItem(key) {
            return this.localStorage.getItem(key);
        }
        removeItem(key) {
            return this.localStorage.removeItem(key);
        }
    }

    var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class GoTrueApi {
        constructor({ url = '', headers = {}, cookieOptions, }) {
            this.url = url;
            this.headers = headers;
            this.cookieOptions = Object.assign(Object.assign({}, COOKIE_OPTIONS), cookieOptions);
        }
        /**
         * Creates a new user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         *
         * @returns A logged-in session if the server has "autoconfirm" ON
         * @returns A user if the server has "autoconfirm" OFF
         */
        signUpWithEmail(email, password, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString = '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(`${this.url}/signup${queryString}`, { email, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Logs in an existing user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        signInWithEmail(email, password, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '?grant_type=password';
                    if (options.redirectTo) {
                        queryString += '&redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(`${this.url}/token${queryString}`, { email, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends a magic login link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        sendMagicLinkEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(`${this.url}/magiclink${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends an invite link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        inviteUserByEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(`${this.url}/invite${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends a reset request to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        resetPasswordForEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(`${this.url}/recover${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Create a temporary object with all configured headers and
         * adds the Authorization token to be used on request methods
         * @param jwt A valid, logged-in JWT.
         */
        _createRequestHeaders(jwt) {
            const headers = Object.assign({}, this.headers);
            headers['Authorization'] = `Bearer ${jwt}`;
            return headers;
        }
        /**
         * Removes a logged-in session.
         * @param jwt A valid, logged-in JWT.
         */
        signOut(jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    yield post$1(`${this.url}/logout`, {}, { headers: this._createRequestHeaders(jwt), noResolveJson: true });
                    return { error: null };
                }
                catch (error) {
                    return { error };
                }
            });
        }
        /**
         * Generates the relevant login URL for a third-party provider.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        getUrlForProvider(provider, options) {
            let urlParams = [`provider=${encodeURIComponent(provider)}`];
            if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
            }
            if (options === null || options === void 0 ? void 0 : options.scopes) {
                urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
            }
            return `${this.url}/authorize?${urlParams.join('&')}`;
        }
        /**
         * Gets the user details.
         * @param jwt A valid, logged-in JWT.
         */
        getUser(jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield get$1(`${this.url}/user`, { headers: this._createRequestHeaders(jwt) });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Updates the user data.
         * @param jwt A valid, logged-in JWT.
         * @param attributes The data you want to update.
         */
        updateUser(jwt, attributes) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield put$1(`${this.url}/user`, attributes, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Delete an user.
         * @param uid The user uid you want to remove.
         * @param jwt A valid JWT. Must be a full-access API key (e.g. service_role key).
         */
        deleteUser(uid, jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield remove$1(`${this.url}/admin/users/${uid}`, {}, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Generates a new JWT.
         * @param refreshToken A valid refresh token that was returned on login.
         */
        refreshAccessToken(refreshToken) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(`${this.url}/token?grant_type=refresh_token`, { refresh_token: refreshToken }, { headers: this.headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Set/delete the auth cookie based on the AuthChangeEvent.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        setAuthCookie(req, res) {
            if (req.method !== 'POST') {
                res.setHeader('Allow', 'POST');
                res.status(405).end('Method Not Allowed');
            }
            const { event, session } = req.body;
            if (!event)
                throw new Error('Auth event missing!');
            if (event === 'SIGNED_IN') {
                if (!session)
                    throw new Error('Auth session missing!');
                setCookie(req, res, {
                    name: this.cookieOptions.name,
                    value: session.access_token,
                    domain: this.cookieOptions.domain,
                    maxAge: this.cookieOptions.lifetime,
                    path: this.cookieOptions.path,
                    sameSite: this.cookieOptions.sameSite,
                });
            }
            if (event === 'SIGNED_OUT')
                deleteCookie(req, res, this.cookieOptions.name);
            res.status(200).json({});
        }
        /**
         * Get user by reading the cookie from the request.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        getUserByCookie(req) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    if (!req.cookies)
                        throw new Error('Not able to parse cookies! When using Express make sure the cookie-parser middleware is in use!');
                    if (!req.cookies[this.cookieOptions.name])
                        throw new Error('No cookie found!');
                    const token = req.cookies[this.cookieOptions.name];
                    const { user, error } = yield this.getUser(token);
                    if (error)
                        throw error;
                    return { user, data: user, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
    }

    // @ts-nocheck
    /**
     * https://mathiasbynens.be/notes/globalthis
     */
    function polyfillGlobalThis() {
        if (typeof globalThis === 'object')
            return;
        try {
            Object.defineProperty(Object.prototype, '__magic__', {
                get: function () {
                    return this;
                },
                configurable: true,
            });
            __magic__.globalThis = __magic__;
            delete Object.prototype.__magic__;
        }
        catch (e) {
            if (typeof self !== 'undefined') {
                self.globalThis = self;
            }
        }
    }

    var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    polyfillGlobalThis(); // Make "globalThis" available
    const DEFAULT_OPTIONS$1 = {
        url: GOTRUE_URL,
        autoRefreshToken: true,
        persistSession: true,
        localStorage: globalThis.localStorage,
        detectSessionInUrl: true,
        headers: DEFAULT_HEADERS,
    };
    class GoTrueClient {
        /**
         * Create a new client for use in the browser.
         * @param options.url The URL of the GoTrue server.
         * @param options.headers Any additional headers to send to the GoTrue server.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.localStorage
         */
        constructor(options) {
            this.stateChangeEmitters = new Map();
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS$1), options);
            this.currentUser = null;
            this.currentSession = null;
            this.autoRefreshToken = settings.autoRefreshToken;
            this.persistSession = settings.persistSession;
            this.localStorage = new LocalStorage(settings.localStorage);
            this.api = new GoTrueApi({
                url: settings.url,
                headers: settings.headers,
                cookieOptions: settings.cookieOptions,
            });
            this._recoverSession();
            this._recoverAndRefresh();
            // Handle the OAuth redirect
            try {
                if (settings.detectSessionInUrl && isBrowser$1() && !!getParameterByName('access_token')) {
                    this.getSessionFromUrl({ storeSession: true });
                }
            }
            catch (error) {
                console.log('Error getting session from URL.');
            }
        }
        /**
         * Creates a new user.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        signUp({ email, password }, options = {}) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    const { data, error } = yield this.api.signUpWithEmail(email, password, {
                        redirectTo: options.redirectTo,
                    });
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw 'An error occurred on sign up.';
                    }
                    let session = null;
                    let user = null;
                    if (data.access_token) {
                        session = data;
                        user = session.user;
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    if (data.id) {
                        user = data;
                    }
                    return { data, user, session, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        /**
         * Log in an existing user, or login via a third-party provider.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param refreshToken A valid refresh token that was returned on login.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        signIn({ email, password, refreshToken, provider }, options = {}) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    if (email && !password) {
                        const { error } = yield this.api.sendMagicLinkEmail(email, {
                            redirectTo: options.redirectTo,
                        });
                        return { data: null, user: null, session: null, error };
                    }
                    if (email && password) {
                        return this._handleEmailSignIn(email, password, {
                            redirectTo: options.redirectTo,
                        });
                    }
                    if (refreshToken) {
                        // currentSession and currentUser will be updated to latest on _callRefreshToken using the passed refreshToken
                        const { error } = yield this._callRefreshToken(refreshToken);
                        if (error)
                            throw error;
                        return {
                            data: this.currentSession,
                            user: this.currentUser,
                            session: this.currentSession,
                            error: null,
                        };
                    }
                    if (provider) {
                        return this._handleProviderSignIn(provider, {
                            redirectTo: options.redirectTo,
                            scopes: options.scopes,
                        });
                    }
                    throw new Error(`You must provide either an email or a third-party provider.`);
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        /**
         * Inside a browser context, `user()` will return the user data, if there is a logged in user.
         *
         * For server-side management, you can get a user through `auth.api.getUserByCookie()`
         */
        user() {
            return this.currentUser;
        }
        /**
         * Returns the session data, if there is an active session.
         */
        session() {
            return this.currentSession;
        }
        /**
         * Force refreshes the session including the user data in case it was updated in a different session.
         */
        refreshSession() {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    // currentSession and currentUser will be updated to latest on _callRefreshToken
                    const { error } = yield this._callRefreshToken();
                    if (error)
                        throw error;
                    return { data: this.currentSession, user: this.currentUser, error: null };
                }
                catch (error) {
                    return { data: null, user: null, error };
                }
            });
        }
        /**
         * Updates user data, if there is a logged in user.
         */
        update(attributes) {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    const { user, error } = yield this.api.updateUser(this.currentSession.access_token, attributes);
                    if (error)
                        throw error;
                    if (!user)
                        throw Error('Invalid user data.');
                    const session = Object.assign(Object.assign({}, this.currentSession), { user });
                    this._saveSession(session);
                    this._notifyAllSubscribers('USER_UPDATED');
                    return { data: user, user, error: null };
                }
                catch (error) {
                    return { data: null, user: null, error };
                }
            });
        }
        /**
         * Sets the session data from refresh_token and returns current Session and Error
         * @param refresh_token a JWT token
         */
        setSession(refresh_token) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error) {
                        return { session: null, error: error };
                    }
                    if (!data) {
                        return {
                            session: null,
                            error: { name: 'Invalid refresh_token', message: 'JWT token provided is Invalid' },
                        };
                    }
                    this._saveSession(data);
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { session: data, error: null };
                }
                catch (error) {
                    return { error, session: null };
                }
            });
        }
        /**
         * Overrides the JWT on the current client. The JWT will then be sent in all subsequent network requests.
         * @param access_token a jwt access token
         */
        setAuth(access_token) {
            this.currentSession = Object.assign(Object.assign({}, this.currentSession), { access_token, token_type: 'bearer', user: null });
            return this.currentSession;
        }
        /**
         * Gets the session data from a URL string
         * @param options.storeSession Optionally store the session in the browser
         */
        getSessionFromUrl(options) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser$1())
                        throw new Error('No browser detected.');
                    const error_description = getParameterByName('error_description');
                    if (error_description)
                        throw new Error(error_description);
                    const provider_token = getParameterByName('provider_token');
                    const access_token = getParameterByName('access_token');
                    if (!access_token)
                        throw new Error('No access_token detected.');
                    const expires_in = getParameterByName('expires_in');
                    if (!expires_in)
                        throw new Error('No expires_in detected.');
                    const refresh_token = getParameterByName('refresh_token');
                    if (!refresh_token)
                        throw new Error('No refresh_token detected.');
                    const token_type = getParameterByName('token_type');
                    if (!token_type)
                        throw new Error('No token_type detected.');
                    const timeNow = Math.round(Date.now() / 1000);
                    const expires_at = timeNow + parseInt(expires_in);
                    const { user, error } = yield this.api.getUser(access_token);
                    if (error)
                        throw error;
                    const session = {
                        provider_token,
                        access_token,
                        expires_in: parseInt(expires_in),
                        expires_at,
                        refresh_token,
                        token_type,
                        user: user,
                    };
                    if (options === null || options === void 0 ? void 0 : options.storeSession) {
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                        if (getParameterByName('type') === 'recovery') {
                            this._notifyAllSubscribers('PASSWORD_RECOVERY');
                        }
                    }
                    // Remove tokens from URL
                    window.location.hash = '';
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Inside a browser context, `signOut()` will remove extract the logged in user from the browser session
         * and log them out - removing all items from localstorage and then trigger a "SIGNED_OUT" event.
         *
         * For server-side management, you can disable sessions by passing a JWT through to `auth.api.signOut(JWT: string)`
         */
        signOut() {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                const accessToken = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token;
                this._removeSession();
                this._notifyAllSubscribers('SIGNED_OUT');
                if (accessToken) {
                    const { error } = yield this.api.signOut(accessToken);
                    if (error)
                        return { error };
                }
                return { error: null };
            });
        }
        /**
         * Receive a notification every time an auth event happens.
         * @returns {Subscription} A subscription object which can be used to unsubscribe itself.
         */
        onAuthStateChange(callback) {
            try {
                const id = uuid();
                const self = this;
                const subscription = {
                    id,
                    callback,
                    unsubscribe: () => {
                        self.stateChangeEmitters.delete(id);
                    },
                };
                this.stateChangeEmitters.set(id, subscription);
                return { data: subscription, error: null };
            }
            catch (error) {
                return { data: null, error };
            }
        }
        _handleEmailSignIn(email, password, options = {}) {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield this.api.signInWithEmail(email, password, {
                        redirectTo: options.redirectTo,
                    });
                    if (error || !data)
                        return { data: null, user: null, session: null, error };
                    if ((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.confirmed_at) {
                        this._saveSession(data);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    return { data, user: data.user, session: data, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        _handleProviderSignIn(provider, options = {}) {
            const url = this.api.getUrlForProvider(provider, {
                redirectTo: options.redirectTo,
                scopes: options.scopes,
            });
            try {
                // try to open on the browser
                if (isBrowser$1()) {
                    window.location.href = url;
                }
                return { provider, url, data: null, session: null, user: null, error: null };
            }
            catch (error) {
                // fallback to returning the URL
                if (!!url)
                    return { provider, url, data: null, session: null, user: null, error: null };
                return { data: null, user: null, session: null, error };
            }
        }
        /**
         * Attempts to get the session from LocalStorage
         * Note: this should never be async (even for React Native), as we need it to return immediately in the constructor.
         */
        _recoverSession() {
            var _a;
            try {
                const json = isBrowser$1() && ((_a = this.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(STORAGE_KEY));
                if (!json || typeof json !== 'string') {
                    return null;
                }
                const data = JSON.parse(json);
                const { currentSession, expiresAt } = data;
                const timeNow = Math.round(Date.now() / 1000);
                if (expiresAt >= timeNow && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.user)) {
                    this._saveSession(currentSession);
                    this._notifyAllSubscribers('SIGNED_IN');
                }
            }
            catch (error) {
                console.log('error', error);
            }
        }
        /**
         * Recovers the session from LocalStorage and refreshes
         * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
         */
        _recoverAndRefresh() {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const json = isBrowser$1() && (yield this.localStorage.getItem(STORAGE_KEY));
                    if (!json) {
                        return null;
                    }
                    const data = JSON.parse(json);
                    const { currentSession, expiresAt } = data;
                    const timeNow = Math.round(Date.now() / 1000);
                    if (expiresAt < timeNow) {
                        if (this.autoRefreshToken && currentSession.refresh_token) {
                            const { error } = yield this._callRefreshToken(currentSession.refresh_token);
                            if (error) {
                                console.log(error.message);
                                yield this._removeSession();
                            }
                        }
                        else {
                            this._removeSession();
                        }
                    }
                    else if (!currentSession || !currentSession.user) {
                        console.log('Current session is missing data.');
                        this._removeSession();
                    }
                    else {
                        // should be handled on _recoverSession method already
                        // But we still need the code here to accommodate for AsyncStorage e.g. in React native
                        this._saveSession(currentSession);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                }
                catch (err) {
                    console.error(err);
                    return null;
                }
            });
        }
        _callRefreshToken(refresh_token) {
            var _a;
            if (refresh_token === void 0) { refresh_token = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.refresh_token; }
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error)
                        throw error;
                    if (!data)
                        throw Error('Invalid session data.');
                    this._saveSession(data);
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        _notifyAllSubscribers(event) {
            this.stateChangeEmitters.forEach((x) => x.callback(event, this.currentSession));
        }
        /**
         * set currentSession and currentUser
         * process to _startAutoRefreshToken if possible
         */
        _saveSession(session) {
            this.currentSession = session;
            this.currentUser = session.user;
            const expiresAt = session.expires_at;
            if (expiresAt) {
                const timeNow = Math.round(Date.now() / 1000);
                const expiresIn = expiresAt - timeNow;
                const refreshDurationBeforeExpires = expiresIn > 60 ? 60 : 0.5;
                this._startAutoRefreshToken((expiresIn - refreshDurationBeforeExpires) * 1000);
            }
            // Do we need any extra check before persist session
            // access_token or user ?
            if (this.persistSession && session.expires_at) {
                this._persistSession(this.currentSession);
            }
        }
        _persistSession(currentSession) {
            const data = { currentSession, expiresAt: currentSession.expires_at };
            isBrowser$1() && this.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        _removeSession() {
            return __awaiter$6(this, void 0, void 0, function* () {
                this.currentSession = null;
                this.currentUser = null;
                if (this.refreshTokenTimer)
                    clearTimeout(this.refreshTokenTimer);
                isBrowser$1() && (yield this.localStorage.removeItem(STORAGE_KEY));
            });
        }
        /**
         * Clear and re-create refresh token timer
         * @param value time intervals in milliseconds
         */
        _startAutoRefreshToken(value) {
            if (this.refreshTokenTimer)
                clearTimeout(this.refreshTokenTimer);
            if (value <= 0 || !this.autoRefreshToken)
                return;
            this.refreshTokenTimer = setTimeout(() => this._callRefreshToken(), value);
            if (typeof this.refreshTokenTimer.unref === 'function')
                this.refreshTokenTimer.unref();
        }
    }

    class SupabaseAuthClient extends GoTrueClient {
        constructor(options) {
            super(options);
        }
    }

    var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class PostgrestBuilder {
        constructor(builder) {
            Object.assign(this, builder);
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
            this.shouldThrowOnError = true;
            return this;
        }
        then(onfulfilled, onrejected) {
            // https://postgrest.org/en/stable/api.html#switching-schemas
            if (typeof this.schema === 'undefined') ;
            else if (['GET', 'HEAD'].includes(this.method)) {
                this.headers['Accept-Profile'] = this.schema;
            }
            else {
                this.headers['Content-Profile'] = this.schema;
            }
            if (this.method !== 'GET' && this.method !== 'HEAD') {
                this.headers['Content-Type'] = 'application/json';
            }
            return fetch$1(this.url.toString(), {
                method: this.method,
                headers: this.headers,
                body: JSON.stringify(this.body),
            })
                .then((res) => __awaiter$5(this, void 0, void 0, function* () {
                var _a, _b, _c;
                let error = null;
                let data = null;
                let count = null;
                if (res.ok) {
                    const isReturnMinimal = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.split(',').includes('return=minimal');
                    if (this.method !== 'HEAD' && !isReturnMinimal) {
                        const text = yield res.text();
                        if (!text) ;
                        else if (this.headers['Accept'] === 'text/csv') {
                            data = text;
                        }
                        else {
                            data = JSON.parse(text);
                        }
                    }
                    const countHeader = (_b = this.headers['Prefer']) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
                    const contentRange = (_c = res.headers.get('content-range')) === null || _c === void 0 ? void 0 : _c.split('/');
                    if (countHeader && contentRange && contentRange.length > 1) {
                        count = parseInt(contentRange[1]);
                    }
                }
                else {
                    error = yield res.json();
                    if (error && this.shouldThrowOnError) {
                        throw error;
                    }
                }
                const postgrestResponse = {
                    error,
                    data,
                    count,
                    status: res.status,
                    statusText: res.statusText,
                    body: data,
                };
                return postgrestResponse;
            }))
                .then(onfulfilled, onrejected);
        }
    }

    /**
     * Post-filters (transforms)
     */
    class PostgrestTransformBuilder extends PostgrestBuilder {
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         */
        select(columns = '*') {
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            return this;
        }
        /**
         * Orders the result with the specified `column`.
         *
         * @param column  The column to order on.
         * @param ascending  If `true`, the result will be in ascending order.
         * @param nullsFirst  If `true`, `null`s appear first.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        order(column, { ascending = true, nullsFirst = false, foreignTable, } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'order' : `${foreignTable}.order`;
            const existingOrder = this.url.searchParams.get(key);
            this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}.${nullsFirst ? 'nullsfirst' : 'nullslast'}`);
            return this;
        }
        /**
         * Limits the result with the specified `count`.
         *
         * @param count  The maximum no. of rows to limit to.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        limit(count, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(key, `${count}`);
            return this;
        }
        /**
         * Limits the result to rows within the specified range, inclusive.
         *
         * @param from  The starting index from which to limit the result, inclusive.
         * @param to  The last index to which to limit the result, inclusive.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        range(from, to, { foreignTable } = {}) {
            const keyOffset = typeof foreignTable === 'undefined' ? 'offset' : `${foreignTable}.offset`;
            const keyLimit = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(keyOffset, `${from}`);
            // Range is inclusive, so add 1
            this.url.searchParams.set(keyLimit, `${to - from + 1}`);
            return this;
        }
        /**
         * Retrieves only one row from the result. Result must be one row (e.g. using
         * `limit`), otherwise this will result in an error.
         */
        single() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            return this;
        }
        /**
         * Retrieves at most one row from the result. Result must be at most one row
         * (e.g. using `eq` on a UNIQUE column), otherwise this will result in an
         * error.
         */
        maybeSingle() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            const _this = new PostgrestTransformBuilder(this);
            _this.then = ((onfulfilled, onrejected) => this.then((res) => {
                var _a;
                if ((_a = res.error) === null || _a === void 0 ? void 0 : _a.details.includes('Results contain 0 rows')) {
                    return onfulfilled({
                        error: null,
                        data: null,
                        count: res.count,
                        status: 200,
                        statusText: 'OK',
                        body: null,
                    });
                }
                return onfulfilled(res);
            }, onrejected));
            return _this;
        }
        /**
         * Set the response type to CSV.
         */
        csv() {
            this.headers['Accept'] = 'text/csv';
            return this;
        }
    }

    class PostgrestFilterBuilder extends PostgrestTransformBuilder {
        constructor() {
            super(...arguments);
            /** @deprecated Use `contains()` instead. */
            this.cs = this.contains;
            /** @deprecated Use `containedBy()` instead. */
            this.cd = this.containedBy;
            /** @deprecated Use `rangeLt()` instead. */
            this.sl = this.rangeLt;
            /** @deprecated Use `rangeGt()` instead. */
            this.sr = this.rangeGt;
            /** @deprecated Use `rangeGte()` instead. */
            this.nxl = this.rangeGte;
            /** @deprecated Use `rangeLte()` instead. */
            this.nxr = this.rangeLte;
            /** @deprecated Use `rangeAdjacent()` instead. */
            this.adj = this.rangeAdjacent;
            /** @deprecated Use `overlaps()` instead. */
            this.ov = this.overlaps;
        }
        /**
         * Finds all rows which doesn't satisfy the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        not(column, operator, value) {
            this.url.searchParams.append(`${column}`, `not.${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows satisfying at least one of the filters.
         *
         * @param filters  The filters to use, separated by commas.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        or(filters, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'or' : `${foreignTable}.or`;
            this.url.searchParams.append(key, `(${filters})`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` exactly matches the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        eq(column, value) {
            this.url.searchParams.append(`${column}`, `eq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` doesn't match the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        neq(column, value) {
            this.url.searchParams.append(`${column}`, `neq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gt(column, value) {
            this.url.searchParams.append(`${column}`, `gt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than or
         * equal to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gte(column, value) {
            this.url.searchParams.append(`${column}`, `gte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lt(column, value) {
            this.url.searchParams.append(`${column}`, `lt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than or equal
         * to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lte(column, value) {
            this.url.searchParams.append(`${column}`, `lte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case sensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        like(column, pattern) {
            this.url.searchParams.append(`${column}`, `like.${pattern}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case insensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        ilike(column, pattern) {
            this.url.searchParams.append(`${column}`, `ilike.${pattern}`);
            return this;
        }
        /**
         * A check for exact equality (null, true, false), finds all rows whose
         * value on the stated `column` exactly match the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        is(column, value) {
            this.url.searchParams.append(`${column}`, `is.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is found on the
         * specified `values`.
         *
         * @param column  The column to filter on.
         * @param values  The values to filter with.
         */
        in(column, values) {
            const cleanedValues = values
                .map((s) => {
                // handle postgrest reserved characters
                // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
                if (typeof s === 'string' && new RegExp('[,()]').test(s))
                    return `"${s}"`;
                else
                    return `${s}`;
            })
                .join(',');
            this.url.searchParams.append(`${column}`, `in.(${cleanedValues})`);
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column`
         * contains the values specified in `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        contains(column, value) {
            if (typeof value === 'string') {
                // range types can be inclusive '[', ']' or exclusive '(', ')' so just
                // keep it simple and accept a string
                this.url.searchParams.append(`${column}`, `cs.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cs.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cs.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column` is
         * contained by the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        containedBy(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `cd.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cd.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cd.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to the
         * left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLt(column, range) {
            this.url.searchParams.append(`${column}`, `sl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to
         * the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGt(column, range) {
            this.url.searchParams.append(`${column}`, `sr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGte(column, range) {
            this.url.searchParams.append(`${column}`, `nxl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLte(column, range) {
            this.url.searchParams.append(`${column}`, `nxr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is adjacent to
         * the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeAdjacent(column, range) {
            this.url.searchParams.append(`${column}`, `adj.${range}`);
            return this;
        }
        /**
         * Finds all rows whose array or range value on the stated `column` overlaps
         * (has a value in common) with the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        overlaps(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `ov.${value}`);
            }
            else {
                // array
                this.url.searchParams.append(`${column}`, `ov.{${value.join(',')}}`);
            }
            return this;
        }
        /**
         * Finds all rows whose text or tsvector value on the stated `column` matches
         * the tsquery in `query`.
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         * @param type  The type of tsquery conversion to use on `query`.
         */
        textSearch(column, query, { config, type = null, } = {}) {
            let typePart = '';
            if (type === 'plain') {
                typePart = 'pl';
            }
            else if (type === 'phrase') {
                typePart = 'ph';
            }
            else if (type === 'websearch') {
                typePart = 'w';
            }
            const configPart = config === undefined ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `${typePart}fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` instead.
         */
        fts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * plainto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'plain'` instead.
         */
        plfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `plfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * phraseto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'phrase'` instead.
         */
        phfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `phfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * websearch_to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'websearch'` instead.
         */
        wfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `wfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose `column` satisfies the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        filter(column, operator, value) {
            this.url.searchParams.append(`${column}`, `${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows whose columns match the specified `query` object.
         *
         * @param query  The object to filter with, with column names as keys mapped
         *               to their filter values.
         */
        match(query) {
            Object.keys(query).forEach((key) => {
                this.url.searchParams.append(`${key}`, `eq.${query[key]}`);
            });
            return this;
        }
    }

    class PostgrestQueryBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema } = {}) {
            super({});
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         * @param head  When set to true, select will void data.
         * @param count  Count algorithm to use to count rows in a table.
         */
        select(columns = '*', { head = false, count = null, } = {}) {
            this.method = 'GET';
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            if (count) {
                this.headers['Prefer'] = `count=${count}`;
            }
            if (head) {
                this.method = 'HEAD';
            }
            return new PostgrestFilterBuilder(this);
        }
        insert(values, { upsert = false, onConflict, returning = 'representation', count = null, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [`return=${returning}`];
            if (upsert)
                prefersHeaders.push('resolution=merge-duplicates');
            if (upsert && onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            if (Array.isArray(values)) {
                const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
                if (columns.length > 0) {
                    const uniqueColumns = [...new Set(columns)];
                    this.url.searchParams.set('columns', uniqueColumns.join(','));
                }
            }
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPSERT into the table.
         *
         * @param values  The values to insert.
         * @param onConflict  By specifying the `on_conflict` query parameter, you can make UPSERT work on a column(s) that has a UNIQUE constraint.
         * @param returning  By default the new record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         * @param ignoreDuplicates  Specifies if duplicate rows should be ignored and not inserted.
         */
        upsert(values, { onConflict, returning = 'representation', count = null, ignoreDuplicates = false, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [
                `resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`,
                `return=${returning}`,
            ];
            if (onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPDATE on the table.
         *
         * @param values  The values to update.
         * @param returning  By default the updated record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         */
        update(values, { returning = 'representation', count = null, } = {}) {
            this.method = 'PATCH';
            const prefersHeaders = [`return=${returning}`];
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs a DELETE on the table.
         *
         * @param returning  If `true`, return the deleted row(s) in the response.
         * @param count  Count algorithm to use to count rows in a table.
         */
        delete({ returning = 'representation', count = null, } = {}) {
            this.method = 'DELETE';
            const prefersHeaders = [`return=${returning}`];
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
    }

    class PostgrestRpcBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema } = {}) {
            super({});
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Perform a stored procedure call.
         */
        rpc(params, { count = null, } = {}) {
            this.method = 'POST';
            this.body = params;
            if (count) {
                if (this.headers['Prefer'] !== undefined)
                    this.headers['Prefer'] += `,count=${count}`;
                else
                    this.headers['Prefer'] = `count=${count}`;
            }
            return new PostgrestFilterBuilder(this);
        }
    }

    class PostgrestClient {
        /**
         * Creates a PostgREST client.
         *
         * @param url  URL of the PostgREST endpoint.
         * @param headers  Custom headers.
         * @param schema  Postgres schema to switch to.
         */
        constructor(url, { headers = {}, schema } = {}) {
            this.url = url;
            this.headers = headers;
            this.schema = schema;
        }
        /**
         * Authenticates the request with JWT.
         *
         * @param token  The JWT token to use.
         */
        auth(token) {
            this.headers['Authorization'] = `Bearer ${token}`;
            return this;
        }
        /**
         * Perform a table operation.
         *
         * @param table  The table name to operate on.
         */
        from(table) {
            const url = `${this.url}/${table}`;
            return new PostgrestQueryBuilder(url, { headers: this.headers, schema: this.schema });
        }
        /**
         * Perform a stored procedure call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         * @param count  Count algorithm to use to count rows in a table.
         */
        rpc(fn, params, { count = null, } = {}) {
            const url = `${this.url}/rpc/${fn}`;
            return new PostgrestRpcBuilder(url, {
                headers: this.headers,
                schema: this.schema,
            }).rpc(params, { count });
        }
    }

    /**
     * Helpers to convert the change Payload into native JS types.
     */
    // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
    // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
    var PostgresTypes;
    (function (PostgresTypes) {
        PostgresTypes["abstime"] = "abstime";
        PostgresTypes["bool"] = "bool";
        PostgresTypes["date"] = "date";
        PostgresTypes["daterange"] = "daterange";
        PostgresTypes["float4"] = "float4";
        PostgresTypes["float8"] = "float8";
        PostgresTypes["int2"] = "int2";
        PostgresTypes["int4"] = "int4";
        PostgresTypes["int4range"] = "int4range";
        PostgresTypes["int8"] = "int8";
        PostgresTypes["int8range"] = "int8range";
        PostgresTypes["json"] = "json";
        PostgresTypes["jsonb"] = "jsonb";
        PostgresTypes["money"] = "money";
        PostgresTypes["numeric"] = "numeric";
        PostgresTypes["oid"] = "oid";
        PostgresTypes["reltime"] = "reltime";
        PostgresTypes["time"] = "time";
        PostgresTypes["timestamp"] = "timestamp";
        PostgresTypes["timestamptz"] = "timestamptz";
        PostgresTypes["timetz"] = "timetz";
        PostgresTypes["tsrange"] = "tsrange";
        PostgresTypes["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    /**
     * Takes an array of columns and an object of string values then converts each string value
     * to its mapped type.
     *
     * @param {{name: String, type: String}[]} columns
     * @param {Object} records
     * @param {Object} options The map of various options that can be applied to the mapper
     * @param {Array} options.skipTypes The array of types that should not be converted
     *
     * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
     * //=>{ first_name: 'Paul', age: 33 }
     */
    const convertChangeData = (columns, records, options = {}) => {
        let result = {};
        let skipTypes = typeof options.skipTypes !== 'undefined' ? options.skipTypes : [];
        Object.entries(records).map(([key, value]) => {
            result[key] = convertColumn(key, columns, records, skipTypes);
        });
        return result;
    };
    /**
     * Converts the value of an individual column.
     *
     * @param {String} columnName The column that you want to convert
     * @param {{name: String, type: String}[]} columns All of the columns
     * @param {Object} records The map of string values
     * @param {Array} skipTypes An array of types that should not be converted
     * @return {object} Useless information
     *
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], ['Paul', '33'], [])
     * //=> 33
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], ['Paul', '33'], ['int4'])
     * //=> "33"
     */
    const convertColumn = (columnName, columns, records, skipTypes) => {
        let column = columns.find((x) => x.name == columnName);
        if (!column || skipTypes.includes(column.type)) {
            return noop$1(records[columnName]);
        }
        else {
            return convertCell(column.type, records[columnName]);
        }
    };
    /**
     * If the value of the cell is `null`, returns null.
     * Otherwise converts the string value to the correct type.
     * @param {String} type A postgres column type
     * @param {String} stringValue The cell value
     *
     * @example convertCell('bool', 'true')
     * //=> true
     * @example convertCell('int8', '10')
     * //=> 10
     * @example convertCell('_int4', '{1,2,3,4}')
     * //=> [1,2,3,4]
     */
    const convertCell = (type, stringValue) => {
        try {
            if (stringValue === null)
                return null;
            // if data type is an array
            if (type.charAt(0) === '_') {
                let arrayValue = type.slice(1, type.length);
                return toArray(stringValue, arrayValue);
            }
            // If not null, convert to correct type.
            switch (type) {
                case PostgresTypes.abstime:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.bool:
                    return toBoolean(stringValue);
                case PostgresTypes.date:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.daterange:
                    return toDateRange(stringValue);
                case PostgresTypes.float4:
                    return toFloat(stringValue);
                case PostgresTypes.float8:
                    return toFloat(stringValue);
                case PostgresTypes.int2:
                    return toInt(stringValue);
                case PostgresTypes.int4:
                    return toInt(stringValue);
                case PostgresTypes.int4range:
                    return toIntRange(stringValue);
                case PostgresTypes.int8:
                    return toInt(stringValue);
                case PostgresTypes.int8range:
                    return toIntRange(stringValue);
                case PostgresTypes.json:
                    return toJson(stringValue);
                case PostgresTypes.jsonb:
                    return toJson(stringValue);
                case PostgresTypes.money:
                    return toFloat(stringValue);
                case PostgresTypes.numeric:
                    return toFloat(stringValue);
                case PostgresTypes.oid:
                    return toInt(stringValue);
                case PostgresTypes.reltime:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.time:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.timestamp:
                    return toTimestampString(stringValue); // Format to be consistent with PostgREST
                case PostgresTypes.timestamptz:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.timetz:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.tsrange:
                    return toDateRange(stringValue);
                case PostgresTypes.tstzrange:
                    return toDateRange(stringValue);
                default:
                    // All the rest will be returned as strings
                    return noop$1(stringValue);
            }
        }
        catch (error) {
            console.log(`Could not convert cell of type ${type} and value ${stringValue}`);
            console.log(`This is the error: ${error}`);
            return stringValue;
        }
    };
    const noop$1 = (stringValue) => {
        return stringValue;
    };
    const toBoolean = (stringValue) => {
        switch (stringValue) {
            case 't':
                return true;
            case 'f':
                return false;
            default:
                return null;
        }
    };
    const toDateRange = (stringValue) => {
        let arr = JSON.parse(stringValue);
        return [new Date(arr[0]), new Date(arr[1])];
    };
    const toFloat = (stringValue) => {
        return parseFloat(stringValue);
    };
    const toInt = (stringValue) => {
        return parseInt(stringValue);
    };
    const toIntRange = (stringValue) => {
        let arr = JSON.parse(stringValue);
        return [parseInt(arr[0]), parseInt(arr[1])];
    };
    const toJson = (stringValue) => {
        return JSON.parse(stringValue);
    };
    /**
     * Converts a Postgres Array into a native JS array
     *
     * @example toArray('{1,2,3,4}', 'int4')
     * //=> [1,2,3,4]
     * @example toArray('{}', 'int4')
     * //=> []
     */
    const toArray = (stringValue, type) => {
        // this takes off the '{' & '}'
        let stringEnriched = stringValue.slice(1, stringValue.length - 1);
        // converts the string into an array
        // if string is empty (meaning the array was empty), an empty array will be immediately returned
        let stringArray = stringEnriched.length > 0 ? stringEnriched.split(',') : [];
        let array = stringArray.map((string) => {
            return convertCell(type, string);
        });
        return array;
    };
    /**
     * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
     * See https://github.com/supabase/supabase/issues/18
     *
     * @example toTimestampString('2019-09-10 00:00:00')
     * //=> '2019-09-10T00:00:00'
     */
    const toTimestampString = (stringValue) => {
        return stringValue.replace(' ', 'T');
    };

    const VSN = '1.0.0';
    const DEFAULT_TIMEOUT = 10000;
    const WS_CLOSE_NORMAL = 1000;
    var SOCKET_STATES;
    (function (SOCKET_STATES) {
        SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
        SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
        SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
        SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function (CHANNEL_STATES) {
        CHANNEL_STATES["closed"] = "closed";
        CHANNEL_STATES["errored"] = "errored";
        CHANNEL_STATES["joined"] = "joined";
        CHANNEL_STATES["joining"] = "joining";
        CHANNEL_STATES["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function (CHANNEL_EVENTS) {
        CHANNEL_EVENTS["close"] = "phx_close";
        CHANNEL_EVENTS["error"] = "phx_error";
        CHANNEL_EVENTS["join"] = "phx_join";
        CHANNEL_EVENTS["reply"] = "phx_reply";
        CHANNEL_EVENTS["leave"] = "phx_leave";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function (TRANSPORTS) {
        TRANSPORTS["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));

    /**
     * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
     *
     * @example
     *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *      return [1000, 5000, 10000][tries - 1] || 10000
     *    })
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     *    reconnectTimer.scheduleTimeout() // fires after 5000
     *    reconnectTimer.reset()
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     */
    class Timer {
        constructor(callback, timerCalc) {
            this.callback = callback;
            this.timerCalc = timerCalc;
            this.timer = undefined;
            this.tries = 0;
            this.callback = callback;
            this.timerCalc = timerCalc;
        }
        reset() {
            this.tries = 0;
            clearTimeout(this.timer);
        }
        // Cancels any previous scheduleTimeout and schedules callback
        scheduleTimeout() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.tries = this.tries + 1;
                this.callback();
            }, this.timerCalc(this.tries + 1));
        }
    }

    class Push {
        /**
         * Initializes the Push
         *
         * @param channel The Channel
         * @param event The event, for example `"phx_join"`
         * @param payload The payload, for example `{user_id: 123}`
         * @param timeout The push timeout in milliseconds
         */
        constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
            this.channel = channel;
            this.event = event;
            this.payload = payload;
            this.timeout = timeout;
            this.sent = false;
            this.timeoutTimer = undefined;
            this.ref = '';
            this.receivedResp = null;
            this.recHooks = [];
            this.refEvent = null;
        }
        resend(timeout) {
            this.timeout = timeout;
            this._cancelRefEvent();
            this.ref = '';
            this.refEvent = null;
            this.receivedResp = null;
            this.sent = false;
            this.send();
        }
        send() {
            if (this._hasReceived('timeout')) {
                return;
            }
            this.startTimeout();
            this.sent = true;
            this.channel.socket.push({
                topic: this.channel.topic,
                event: this.event,
                payload: this.payload,
                ref: this.ref,
            });
        }
        receive(status, callback) {
            var _a;
            if (this._hasReceived(status)) {
                callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
            }
            this.recHooks.push({ status, callback });
            return this;
        }
        startTimeout() {
            if (this.timeoutTimer) {
                return;
            }
            this.ref = this.channel.socket.makeRef();
            this.refEvent = this.channel.replyEventName(this.ref);
            this.channel.on(this.refEvent, (payload) => {
                this._cancelRefEvent();
                this._cancelTimeout();
                this.receivedResp = payload;
                this._matchReceive(payload);
            });
            this.timeoutTimer = setTimeout(() => {
                this.trigger('timeout', {});
            }, this.timeout);
        }
        trigger(status, response) {
            if (this.refEvent)
                this.channel.trigger(this.refEvent, { status, response });
        }
        _cancelRefEvent() {
            if (!this.refEvent) {
                return;
            }
            this.channel.off(this.refEvent);
        }
        _cancelTimeout() {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        _matchReceive({ status, response, }) {
            this.recHooks
                .filter((h) => h.status === status)
                .forEach((h) => h.callback(response));
        }
        _hasReceived(status) {
            return this.receivedResp && this.receivedResp.status === status;
        }
    }

    class RealtimeSubscription {
        constructor(topic, params = {}, socket) {
            this.topic = topic;
            this.params = params;
            this.socket = socket;
            this.bindings = [];
            this.state = CHANNEL_STATES.closed;
            this.joinedOnce = false;
            this.pushBuffer = [];
            this.timeout = this.socket.timeout;
            this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
            this.rejoinTimer = new Timer(() => this.rejoinUntilConnected(), this.socket.reconnectAfterMs);
            this.joinPush.receive('ok', () => {
                this.state = CHANNEL_STATES.joined;
                this.rejoinTimer.reset();
                this.pushBuffer.forEach((pushEvent) => pushEvent.send());
                this.pushBuffer = [];
            });
            this.onClose(() => {
                this.rejoinTimer.reset();
                this.socket.log('channel', `close ${this.topic} ${this.joinRef()}`);
                this.state = CHANNEL_STATES.closed;
                this.socket.remove(this);
            });
            this.onError((reason) => {
                if (this.isLeaving() || this.isClosed()) {
                    return;
                }
                this.socket.log('channel', `error ${this.topic}`, reason);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.joinPush.receive('timeout', () => {
                if (!this.isJoining()) {
                    return;
                }
                this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.on(CHANNEL_EVENTS.reply, (payload, ref) => {
                this.trigger(this.replyEventName(ref), payload);
            });
        }
        rejoinUntilConnected() {
            this.rejoinTimer.scheduleTimeout();
            if (this.socket.isConnected()) {
                this.rejoin();
            }
        }
        subscribe(timeout = this.timeout) {
            if (this.joinedOnce) {
                throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
            }
            else {
                this.joinedOnce = true;
                this.rejoin(timeout);
                return this.joinPush;
            }
        }
        onClose(callback) {
            this.on(CHANNEL_EVENTS.close, callback);
        }
        onError(callback) {
            this.on(CHANNEL_EVENTS.error, (reason) => callback(reason));
        }
        on(event, callback) {
            this.bindings.push({ event, callback });
        }
        off(event) {
            this.bindings = this.bindings.filter((bind) => bind.event !== event);
        }
        canPush() {
            return this.socket.isConnected() && this.isJoined();
        }
        push(event, payload, timeout = this.timeout) {
            if (!this.joinedOnce) {
                throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
            }
            let pushEvent = new Push(this, event, payload, timeout);
            if (this.canPush()) {
                pushEvent.send();
            }
            else {
                pushEvent.startTimeout();
                this.pushBuffer.push(pushEvent);
            }
            return pushEvent;
        }
        /**
         * Leaves the channel
         *
         * Unsubscribes from server events, and instructs channel to terminate on server.
         * Triggers onClose() hooks.
         *
         * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
         * channel.unsubscribe().receive("ok", () => alert("left!") )
         */
        unsubscribe(timeout = this.timeout) {
            this.state = CHANNEL_STATES.leaving;
            let onClose = () => {
                this.socket.log('channel', `leave ${this.topic}`);
                this.trigger(CHANNEL_EVENTS.close, 'leave', this.joinRef());
            };
            let leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
            leavePush.receive('ok', () => onClose()).receive('timeout', () => onClose());
            leavePush.send();
            if (!this.canPush()) {
                leavePush.trigger('ok', {});
            }
            return leavePush;
        }
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling before dispatching to the channel callbacks.
         * Must return the payload, modified or unmodified.
         */
        onMessage(event, payload, ref) {
            return payload;
        }
        isMember(topic) {
            return this.topic === topic;
        }
        joinRef() {
            return this.joinPush.ref;
        }
        sendJoin(timeout) {
            this.state = CHANNEL_STATES.joining;
            this.joinPush.resend(timeout);
        }
        rejoin(timeout = this.timeout) {
            if (this.isLeaving()) {
                return;
            }
            this.sendJoin(timeout);
        }
        trigger(event, payload, ref) {
            let { close, error, leave, join } = CHANNEL_EVENTS;
            let events = [close, error, leave, join];
            if (ref && events.indexOf(event) >= 0 && ref !== this.joinRef()) {
                return;
            }
            let handledPayload = this.onMessage(event, payload, ref);
            if (payload && !handledPayload) {
                throw 'channel onMessage callbacks must return the payload, modified or unmodified';
            }
            this.bindings
                .filter((bind) => {
                // Bind all events if the user specifies a wildcard.
                if (bind.event === '*') {
                    return event === (payload === null || payload === void 0 ? void 0 : payload.type);
                }
                else {
                    return bind.event === event;
                }
            })
                .map((bind) => bind.callback(handledPayload, ref));
        }
        replyEventName(ref) {
            return `chan_reply_${ref}`;
        }
        isClosed() {
            return this.state === CHANNEL_STATES.closed;
        }
        isErrored() {
            return this.state === CHANNEL_STATES.errored;
        }
        isJoined() {
            return this.state === CHANNEL_STATES.joined;
        }
        isJoining() {
            return this.state === CHANNEL_STATES.joining;
        }
        isLeaving() {
            return this.state === CHANNEL_STATES.leaving;
        }
    }

    var naiveFallback = function () {
    	if (typeof self === "object" && self) return self;
    	if (typeof window === "object" && window) return window;
    	throw new Error("Unable to resolve global `this`");
    };

    var global$1 = (function () {
    	if (this) return this;

    	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    	// Fallback to standard globalThis if available
    	if (typeof globalThis === "object" && globalThis) return globalThis;

    	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    	// In all ES5+ engines global object inherits from Object.prototype
    	// (if you approached one that doesn't please report)
    	try {
    		Object.defineProperty(Object.prototype, "__global__", {
    			get: function () { return this; },
    			configurable: true
    		});
    	} catch (error) {
    		// Unfortunate case of updates to Object.prototype being restricted
    		// via preventExtensions, seal or freeze
    		return naiveFallback();
    	}
    	try {
    		// Safari case (window.__global__ works, but __global__ does not)
    		if (!__global__) return naiveFallback();
    		return __global__;
    	} finally {
    		delete Object.prototype.__global__;
    	}
    })();

    var _from = "websocket@^1.0.34";
    var _id = "websocket@1.0.34";
    var _inBundle = false;
    var _integrity = "sha512-PRDso2sGwF6kM75QykIesBijKSVceR6jL2G8NGYyq2XrItNC2P5/qL5XeR056GhA+Ly7JMFvJb9I312mJfmqnQ==";
    var _location = "/websocket";
    var _phantomChildren = {
    };
    var _requested = {
    	type: "range",
    	registry: true,
    	raw: "websocket@^1.0.34",
    	name: "websocket",
    	escapedName: "websocket",
    	rawSpec: "^1.0.34",
    	saveSpec: null,
    	fetchSpec: "^1.0.34"
    };
    var _requiredBy = [
    	"/@supabase/realtime-js"
    ];
    var _resolved = "https://registry.npmjs.org/websocket/-/websocket-1.0.34.tgz";
    var _shasum = "2bdc2602c08bf2c82253b730655c0ef7dcab3111";
    var _spec = "websocket@^1.0.34";
    var _where = "C:\\Users\\RogerVeciana\\Documents\\ss\\svelte\\supabase-svelte\\node_modules\\@supabase\\realtime-js";
    var author = {
    	name: "Brian McKelvey",
    	email: "theturtle32@gmail.com",
    	url: "https://github.com/theturtle32"
    };
    var browser$1 = "lib/browser.js";
    var bugs = {
    	url: "https://github.com/theturtle32/WebSocket-Node/issues"
    };
    var bundleDependencies = false;
    var config = {
    	verbose: false
    };
    var contributors = [
    	{
    		name: "Iñaki Baz Castillo",
    		email: "ibc@aliax.net",
    		url: "http://dev.sipdoc.net"
    	}
    ];
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var deprecated = false;
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	jshint: "^2.0.0",
    	"jshint-stylish": "^2.2.1",
    	tape: "^4.9.1"
    };
    var directories = {
    	lib: "./lib"
    };
    var engines = {
    	node: ">=4.0.0"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var license = "Apache-2.0";
    var main = "index";
    var name = "websocket";
    var repository = {
    	type: "git",
    	url: "git+https://github.com/theturtle32/WebSocket-Node.git"
    };
    var scripts = {
    	gulp: "gulp",
    	test: "tape test/unit/*.js"
    };
    var version$1 = "1.0.34";
    var require$$0 = {
    	_from: _from,
    	_id: _id,
    	_inBundle: _inBundle,
    	_integrity: _integrity,
    	_location: _location,
    	_phantomChildren: _phantomChildren,
    	_requested: _requested,
    	_requiredBy: _requiredBy,
    	_resolved: _resolved,
    	_shasum: _shasum,
    	_spec: _spec,
    	_where: _where,
    	author: author,
    	browser: browser$1,
    	bugs: bugs,
    	bundleDependencies: bundleDependencies,
    	config: config,
    	contributors: contributors,
    	dependencies: dependencies,
    	deprecated: deprecated,
    	description: description,
    	devDependencies: devDependencies,
    	directories: directories,
    	engines: engines,
    	homepage: homepage,
    	keywords: keywords,
    	license: license,
    	main: main,
    	name: name,
    	repository: repository,
    	scripts: scripts,
    	version: version$1
    };

    var version = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = global$1;
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : version
    };

    // This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
    // License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
    class Serializer {
        constructor() {
            this.HEADER_LENGTH = 1;
        }
        decode(rawPayload, callback) {
            if (rawPayload.constructor === ArrayBuffer) {
                return callback(this._binaryDecode(rawPayload));
            }
            if (typeof rawPayload === 'string') {
                return callback(JSON.parse(rawPayload));
            }
            return callback({});
        }
        _binaryDecode(buffer) {
            const view = new DataView(buffer);
            const decoder = new TextDecoder();
            return this._decodeBroadcast(buffer, view, decoder);
        }
        _decodeBroadcast(buffer, view, decoder) {
            const topicSize = view.getUint8(1);
            const eventSize = view.getUint8(2);
            let offset = this.HEADER_LENGTH + 2;
            const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
            offset = offset + topicSize;
            const event = decoder.decode(buffer.slice(offset, offset + eventSize));
            offset = offset + eventSize;
            const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
            return { ref: null, topic: topic, event: event, payload: data };
        }
    }

    var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const noop = () => { };
    class RealtimeClient {
        /**
         * Initializes the Socket
         *
         * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
         * @param options.transport The Websocket Transport, for example WebSocket.
         * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
         * @param options.params The optional params to pass when connecting.
         * @param options.headers The optional headers to pass when connecting.
         * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
         * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
         * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
         * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
         * @param options.longpollerTimeout The maximum timeout of a long poll AJAX request. Defaults to 20s (double the server long poll timer).
         * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
         */
        constructor(endPoint, options) {
            this.channels = [];
            this.endPoint = '';
            this.headers = {};
            this.params = {};
            this.timeout = DEFAULT_TIMEOUT;
            this.transport = browser.w3cwebsocket;
            this.heartbeatIntervalMs = 30000;
            this.longpollerTimeout = 20000;
            this.heartbeatTimer = undefined;
            this.pendingHeartbeatRef = null;
            this.ref = 0;
            this.logger = noop;
            this.conn = null;
            this.sendBuffer = [];
            this.serializer = new Serializer();
            this.stateChangeCallbacks = {
                open: [],
                close: [],
                error: [],
                message: [],
            };
            this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
            if (options === null || options === void 0 ? void 0 : options.params)
                this.params = options.params;
            if (options === null || options === void 0 ? void 0 : options.headers)
                this.headers = options.headers;
            if (options === null || options === void 0 ? void 0 : options.timeout)
                this.timeout = options.timeout;
            if (options === null || options === void 0 ? void 0 : options.logger)
                this.logger = options.logger;
            if (options === null || options === void 0 ? void 0 : options.transport)
                this.transport = options.transport;
            if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
                this.heartbeatIntervalMs = options.heartbeatIntervalMs;
            if (options === null || options === void 0 ? void 0 : options.longpollerTimeout)
                this.longpollerTimeout = options.longpollerTimeout;
            this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs) ? options.reconnectAfterMs
                : (tries) => {
                    return [1000, 2000, 5000, 10000][tries - 1] || 10000;
                };
            this.encode = (options === null || options === void 0 ? void 0 : options.encode) ? options.encode
                : (payload, callback) => {
                    return callback(JSON.stringify(payload));
                };
            this.decode = (options === null || options === void 0 ? void 0 : options.decode) ? options.decode
                : this.serializer.decode.bind(this.serializer);
            this.reconnectTimer = new Timer(() => __awaiter$4(this, void 0, void 0, function* () {
                yield this.disconnect();
                this.connect();
            }), this.reconnectAfterMs);
        }
        /**
         * Connects the socket.
         */
        connect() {
            if (this.conn) {
                return;
            }
            this.conn = new this.transport(this.endPointURL(), [], null, this.headers);
            if (this.conn) {
                // this.conn.timeout = this.longpollerTimeout // TYPE ERROR
                this.conn.binaryType = 'arraybuffer';
                this.conn.onopen = () => this._onConnOpen();
                this.conn.onerror = (error) => this._onConnError(error);
                this.conn.onmessage = (event) => this.onConnMessage(event);
                this.conn.onclose = (event) => this._onConnClose(event);
            }
        }
        /**
         * Disconnects the socket.
         *
         * @param code A numeric status code to send on disconnect.
         * @param reason A custom reason for the disconnect.
         */
        disconnect(code, reason) {
            return new Promise((resolve, _reject) => {
                try {
                    if (this.conn) {
                        this.conn.onclose = function () { }; // noop
                        if (code) {
                            this.conn.close(code, reason || '');
                        }
                        else {
                            this.conn.close();
                        }
                        this.conn = null;
                    }
                    resolve({ error: null, data: true });
                }
                catch (error) {
                    resolve({ error, data: false });
                }
            });
        }
        /**
         * Logs the message. Override `this.logger` for specialized logging.
         */
        log(kind, msg, data) {
            this.logger(kind, msg, data);
        }
        /**
         * Registers a callback for connection state change event.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket opened."))
         */
        onOpen(callback) {
            this.stateChangeCallbacks.open.push(callback);
        }
        /**
         * Registers a callbacks for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket closed."))
         */
        onClose(callback) {
            this.stateChangeCallbacks.close.push(callback);
        }
        /**
         * Registers a callback for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen((error) => console.log("An error occurred"))
         */
        onError(callback) {
            this.stateChangeCallbacks.error.push(callback);
        }
        /**
         * Calls a function any time a message is received.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onMessage((message) => console.log(message))
         */
        onMessage(callback) {
            this.stateChangeCallbacks.message.push(callback);
        }
        /**
         * Returns the current state of the socket.
         */
        connectionState() {
            switch (this.conn && this.conn.readyState) {
                case SOCKET_STATES.connecting:
                    return 'connecting';
                case SOCKET_STATES.open:
                    return 'open';
                case SOCKET_STATES.closing:
                    return 'closing';
                default:
                    return 'closed';
            }
        }
        /**
         * Retuns `true` is the connection is open.
         */
        isConnected() {
            return this.connectionState() === 'open';
        }
        /**
         * Removes a subscription from the socket.
         *
         * @param channel An open subscription.
         */
        remove(channel) {
            this.channels = this.channels.filter((c) => c.joinRef() !== channel.joinRef());
        }
        channel(topic, chanParams = {}) {
            let chan = new RealtimeSubscription(topic, chanParams, this);
            this.channels.push(chan);
            return chan;
        }
        push(data) {
            let { topic, event, payload, ref } = data;
            let callback = () => {
                this.encode(data, (result) => {
                    var _a;
                    (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
                });
            };
            this.log('push', `${topic} ${event} (${ref})`, payload);
            if (this.isConnected()) {
                callback();
            }
            else {
                this.sendBuffer.push(callback);
            }
        }
        onConnMessage(rawMessage) {
            this.decode(rawMessage.data, (msg) => {
                let { topic, event, payload, ref } = msg;
                if (ref && ref === this.pendingHeartbeatRef) {
                    this.pendingHeartbeatRef = null;
                }
                else if (event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
                    this._resetHeartbeat();
                }
                this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
                this.channels
                    .filter((channel) => channel.isMember(topic))
                    .forEach((channel) => channel.trigger(event, payload, ref));
                this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
            });
        }
        /**
         * Returns the URL of the websocket.
         */
        endPointURL() {
            return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
        }
        /**
         * Return the next message ref, accounting for overflows
         */
        makeRef() {
            let newRef = this.ref + 1;
            if (newRef === this.ref) {
                this.ref = 0;
            }
            else {
                this.ref = newRef;
            }
            return this.ref.toString();
        }
        _onConnOpen() {
            this.log('transport', `connected to ${this.endPointURL()}`);
            this._flushSendBuffer();
            this.reconnectTimer.reset();
            this._resetHeartbeat();
            this.stateChangeCallbacks.open.forEach((callback) => callback());
        }
        _onConnClose(event) {
            this.log('transport', 'close', event);
            this._triggerChanError();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.scheduleTimeout();
            this.stateChangeCallbacks.close.forEach((callback) => callback(event));
        }
        _onConnError(error) {
            this.log('transport', error.message);
            this._triggerChanError();
            this.stateChangeCallbacks.error.forEach((callback) => callback(error));
        }
        _triggerChanError() {
            this.channels.forEach((channel) => channel.trigger(CHANNEL_EVENTS.error));
        }
        _appendParams(url, params) {
            if (Object.keys(params).length === 0) {
                return url;
            }
            const prefix = url.match(/\?/) ? '&' : '?';
            const query = new URLSearchParams(params);
            return `${url}${prefix}${query}`;
        }
        _flushSendBuffer() {
            if (this.isConnected() && this.sendBuffer.length > 0) {
                this.sendBuffer.forEach((callback) => callback());
                this.sendBuffer = [];
            }
        }
        _resetHeartbeat() {
            this.pendingHeartbeatRef = null;
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
        }
        _sendHeartbeat() {
            var _a;
            if (!this.isConnected()) {
                return;
            }
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
                this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
                return;
            }
            this.pendingHeartbeatRef = this.makeRef();
            this.push({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: this.pendingHeartbeatRef,
            });
        }
    }

    class SupabaseRealtimeClient {
        constructor(socket, schema, tableName) {
            const topic = tableName === '*' ? `realtime:${schema}` : `realtime:${schema}:${tableName}`;
            this.subscription = socket.channel(topic);
        }
        getPayloadRecords(payload) {
            const records = {
                new: {},
                old: {},
            };
            if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
                records.new = convertChangeData(payload.columns, payload.record);
            }
            if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
                records.old = convertChangeData(payload.columns, payload.old_record);
            }
            return records;
        }
        /**
         * The event you want to listen to.
         *
         * @param event The event
         * @param callback A callback function that is called whenever the event occurs.
         */
        on(event, callback) {
            this.subscription.on(event, (payload) => {
                let enrichedPayload = {
                    schema: payload.schema,
                    table: payload.table,
                    commit_timestamp: payload.commit_timestamp,
                    eventType: payload.type,
                    new: {},
                    old: {},
                };
                enrichedPayload = Object.assign(Object.assign({}, enrichedPayload), this.getPayloadRecords(payload));
                callback(enrichedPayload);
            });
            return this;
        }
        /**
         * Enables the subscription.
         */
        subscribe(callback = () => { }) {
            this.subscription.onError((e) => callback('SUBSCRIPTION_ERROR', e));
            this.subscription.onClose(() => callback('CLOSED'));
            this.subscription
                .subscribe()
                .receive('ok', () => callback('SUBSCRIBED'))
                .receive('error', (e) => callback('SUBSCRIPTION_ERROR', e))
                .receive('timeout', () => callback('RETRYING_AFTER_TIMEOUT'));
            return this.subscription;
        }
    }

    class SupabaseQueryBuilder extends PostgrestQueryBuilder {
        constructor(url, { headers = {}, schema, realtime, table, }) {
            super(url, { headers, schema });
            this._subscription = new SupabaseRealtimeClient(realtime, schema, table);
            this._realtime = realtime;
        }
        /**
         * Subscribe to realtime changes in your databse.
         * @param event The database event which you would like to receive updates for, or you can use the special wildcard `*` to listen to all changes.
         * @param callback A callback that will handle the payload that is sent whenever your database changes.
         */
        on(event, callback) {
            if (!this._realtime.isConnected()) {
                this._realtime.connect();
            }
            return this._subscription.on(event, callback);
        }
    }

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest(method, url, options, parameters, body) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetch$1(url, _getRequestParams(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve(result);
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError(error, reject));
            });
        });
    }
    function get(url, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest('GET', url, options, parameters);
        });
    }
    function post(url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest('POST', url, options, parameters, body);
        });
    }
    function put(url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest('PUT', url, options, parameters, body);
        });
    }
    function remove(url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest('DELETE', url, options, parameters, body);
        });
    }

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class StorageBucketApi {
        constructor(url, headers = {}) {
            this.url = url;
            this.headers = headers;
        }
        /**
         * Retrieves the details of all Storage buckets within an existing product.
         */
        listBuckets() {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield get(`${this.url}/bucket`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieves the details of an existing Storage bucket.
         *
         * @param id The unique identifier of the bucket you would like to retrieve.
         */
        getBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield get(`${this.url}/bucket/${id}`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Creates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         * @returns newly created bucket id
         */
        createBucket(id, options = { public: false }) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield post(`${this.url}/bucket`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data: data.name, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Updates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         */
        updateBucket(id, options) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield put(`${this.url}/bucket/${id}`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Removes all objects inside a single bucket.
         *
         * @param id The unique identifier of the bucket you would like to empty.
         */
        emptyBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield post(`${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
         * You must first `empty()` the bucket.
         *
         * @param id The unique identifier of the bucket you would like to delete.
         */
        deleteBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(`${this.url}/bucket/${id}`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
    }

    const isBrowser = () => typeof window !== 'undefined';

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_SEARCH_OPTIONS = {
        limit: 100,
        offset: 0,
        sortBy: {
            column: 'name',
            order: 'asc',
        },
    };
    const DEFAULT_FILE_OPTIONS = {
        cacheControl: '3600',
        upsert: false,
    };
    class StorageFileApi {
        constructor(url, headers = {}, bucketId) {
            this.url = url;
            this.headers = headers;
            this.bucketId = bucketId;
        }
        /**
         * Uploads a file to an existing bucket.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param file The File object to be stored in the bucket.
         * @param fileOptions HTTP headers. For example `cacheControl`
         */
        upload(path, file, fileOptions) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser())
                        throw new Error('No browser detected.');
                    const formData = new FormData();
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    formData.append('cacheControl', options.cacheControl);
                    formData.append('', file, file.name);
                    const _path = this._getFinalPath(path);
                    const res = yield fetch(`${this.url}/object/${_path}`, {
                        method: 'POST',
                        body: formData,
                        headers: Object.assign(Object.assign({}, this.headers), { 'x-upsert': String(fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.upsert) }),
                    });
                    if (res.ok) {
                        // const data = await res.json()
                        // temporary fix till backend is updated to the latest storage-api version
                        return { data: { Key: _path }, error: null };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Replaces an existing file at the specified path with a new one.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder`. The bucket already exist before attempting to upload.
         * @param file The file object to be stored in the bucket.
         * @param fileOptions HTTP headers. For example `cacheControl`
         */
        update(path, file, fileOptions) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser())
                        throw new Error('No browser detected.');
                    const formData = new FormData();
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    formData.append('cacheControl', options.cacheControl);
                    formData.append('', file, file.name);
                    const _path = this._getFinalPath(path);
                    const res = yield fetch(`${this.url}/object/${_path}`, {
                        method: 'PUT',
                        body: formData,
                        headers: Object.assign({}, this.headers),
                    });
                    if (res.ok) {
                        // const data = await res.json()
                        // temporary fix till backend is updated to the latest storage-api version
                        return { data: { Key: _path }, error: null };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Moves an existing file, optionally renaming it at the same time.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
         */
        move(fromPath, toPath) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield post(`${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Create signed url to download file without requiring permissions. This URL can be valid for a set number of seconds.
         *
         * @param path The file path to be downloaded, including the current file name. For example `folder/image.png`.
         * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
         */
        createSignedUrl(path, expiresIn) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    let data = yield post(`${this.url}/object/sign/${_path}`, { expiresIn }, { headers: this.headers });
                    const signedURL = `${this.url}${data.signedURL}`;
                    data = { signedURL };
                    return { data, error: null, signedURL };
                }
                catch (error) {
                    return { data: null, error, signedURL: null };
                }
            });
        }
        /**
         * Downloads a file.
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        download(path) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    const res = yield get(`${this.url}/object/${_path}`, {
                        headers: this.headers,
                        noResolveJson: true,
                    });
                    const data = yield res.blob();
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieve URLs for assets in public buckets
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        getPublicUrl(path) {
            try {
                const _path = this._getFinalPath(path);
                const publicURL = `${this.url}/object/public/${_path}`;
                const data = { publicURL };
                return { data, error: null, publicURL };
            }
            catch (error) {
                return { data: null, error, publicURL: null };
            }
        }
        /**
         * Deletes files within the same bucket
         *
         * @param paths An array of files to be deletes, including the path and file name. For example [`folder/image.png`].
         */
        remove(paths) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(`${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Get file metadata
         * @param id the file id to retrieve metadata
         */
        // async getMetadata(id: string): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await get(`${this.url}/metadata/${id}`, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Update file metadata
         * @param id the file id to update metadata
         * @param meta the new file metadata
         */
        // async updateMetadata(
        //   id: string,
        //   meta: Metadata
        // ): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await post(`${this.url}/metadata/${id}`, { ...meta }, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Lists all the files within a bucket.
         * @param path The folder path.
         * @param options Search options, including `limit`, `offset`, and `sortBy`.
         * @param parameters Fetch parameters, currently only supports `signal`, which is an AbortController's signal
         */
        list(path, options, parameters) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                    const data = yield post(`${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        _getFinalPath(path) {
            return `${this.bucketId}/${path}`;
        }
    }

    class SupabaseStorageClient extends StorageBucketApi {
        constructor(url, headers = {}) {
            super(url, headers);
        }
        /**
         * Perform file operation in a bucket.
         *
         * @param id The bucket id to operate on.
         */
        from(id) {
            return new StorageFileApi(this.url, this.headers, id);
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_OPTIONS = {
        schema: 'public',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        localStorage: globalThis.localStorage,
        headers: DEFAULT_HEADERS$1,
    };
    /**
     * Supabase Client.
     *
     * An isomorphic Javascript client for interacting with Postgres.
     */
    class SupabaseClient {
        /**
         * Create a new client for use in the browser.
         * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
         * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
         * @param options.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.headers Any additional headers to send with each network request.
         */
        constructor(supabaseUrl, supabaseKey, options) {
            this.supabaseUrl = supabaseUrl;
            this.supabaseKey = supabaseKey;
            if (!supabaseUrl)
                throw new Error('supabaseUrl is required.');
            if (!supabaseKey)
                throw new Error('supabaseKey is required.');
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
            this.restUrl = `${supabaseUrl}/rest/v1`;
            this.realtimeUrl = `${supabaseUrl}/realtime/v1`.replace('http', 'ws');
            this.authUrl = `${supabaseUrl}/auth/v1`;
            this.storageUrl = `${supabaseUrl}/storage/v1`;
            this.schema = settings.schema;
            this.auth = this._initSupabaseAuthClient(settings);
            this.realtime = this._initRealtimeClient();
            // In the future we might allow the user to pass in a logger to receive these events.
            // this.realtime.onOpen(() => console.log('OPEN'))
            // this.realtime.onClose(() => console.log('CLOSED'))
            // this.realtime.onError((e: Error) => console.log('Socket error', e))
        }
        /**
         * Supabase Storage allows you to manage user-generated content, such as photos or videos.
         */
        get storage() {
            return new SupabaseStorageClient(this.storageUrl, this._getAuthHeaders());
        }
        /**
         * Perform a table operation.
         *
         * @param table The table name to operate on.
         */
        from(table) {
            const url = `${this.restUrl}/${table}`;
            return new SupabaseQueryBuilder(url, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
                realtime: this.realtime,
                table,
            });
        }
        /**
         * Perform a stored procedure call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         */
        rpc(fn, params) {
            const rest = this._initPostgRESTClient();
            return rest.rpc(fn, params);
        }
        /**
         * Removes an active subscription and returns the number of open connections.
         *
         * @param subscription The subscription you want to remove.
         */
        removeSubscription(subscription) {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this._closeSubscription(subscription);
                    const openSubscriptions = this.getSubscriptions().length;
                    if (!openSubscriptions) {
                        const { error } = yield this.realtime.disconnect();
                        if (error)
                            return resolve({ error });
                    }
                    return resolve({ error: null, data: { openSubscriptions } });
                }
                catch (error) {
                    return resolve({ error });
                }
            }));
        }
        _closeSubscription(subscription) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!subscription.isClosed()) {
                    yield this._closeChannel(subscription);
                }
            });
        }
        /**
         * Returns an array of all your subscriptions.
         */
        getSubscriptions() {
            return this.realtime.channels;
        }
        _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, localStorage, }) {
            return new SupabaseAuthClient({
                url: this.authUrl,
                headers: {
                    Authorization: `Bearer ${this.supabaseKey}`,
                    apikey: `${this.supabaseKey}`,
                },
                autoRefreshToken,
                persistSession,
                detectSessionInUrl,
                localStorage,
            });
        }
        _initRealtimeClient() {
            return new RealtimeClient(this.realtimeUrl, {
                params: { apikey: this.supabaseKey },
            });
        }
        _initPostgRESTClient() {
            return new PostgrestClient(this.restUrl, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
            });
        }
        _getAuthHeaders() {
            var _a, _b;
            const headers = {};
            const authBearer = (_b = (_a = this.auth.session()) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
            headers['apikey'] = this.supabaseKey;
            headers['Authorization'] = `Bearer ${authBearer}`;
            return headers;
        }
        _closeChannel(subscription) {
            return new Promise((resolve, reject) => {
                subscription
                    .unsubscribe()
                    .receive('ok', () => {
                    this.realtime.remove(subscription);
                    return resolve(true);
                })
                    .receive('error', (e) => reject(e));
            });
        }
    }

    /**
     * Creates a new Supabase Client.
     */
    const createClient = (supabaseUrl, supabaseKey, options) => {
        return new SupabaseClient(supabaseUrl, supabaseKey, options);
    };

    const supabaseUrl = {"env":{"isProd":false,"SVELTE_APP_SUPABASE_URL":"https://itkjgxfemunkwtiuralq.supabase.co","SVELTE_APP_SUPABASE_ANON_KEY":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNjA3OTU4NCwiZXhwIjoxOTQxNjU1NTg0fQ.GMvgFm-xu-NwZQw8XbgPGksL55vbwKw0LeiSpnGYpvE"}}.env.SVELTE_APP_SUPABASE_URL;
    const supabaseAnonKey = {"env":{"isProd":false,"SVELTE_APP_SUPABASE_URL":"https://itkjgxfemunkwtiuralq.supabase.co","SVELTE_APP_SUPABASE_ANON_KEY":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNjA3OTU4NCwiZXhwIjoxOTQxNjU1NTg0fQ.GMvgFm-xu-NwZQw8XbgPGksL55vbwKw0LeiSpnGYpvE"}}.env.SVELTE_APP_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    /* src\App.svelte generated by Svelte v3.38.3 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].id;
    	child_ctx[12] = list[i].location_name;
    	child_ctx[13] = list[i].geom;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (50:1) {#each geometries as { id, location_name, geom }
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*id*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let t2_value = /*location_name*/ ctx[12] + "";
    	let t2;
    	let t3;
    	let t4_value = (/*geom*/ ctx[13] && /*geom*/ ctx[13].coordinates) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text("-");
    			t2 = text(t2_value);
    			t3 = text("-");
    			t4 = text(t4_value);
    			add_location(div, file, 50, 2, 1003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*geometries*/ 8 && t0_value !== (t0_value = /*id*/ ctx[11] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*geometries*/ 8 && t2_value !== (t2_value = /*location_name*/ ctx[12] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*geometries*/ 8 && t4_value !== (t4_value = (/*geom*/ ctx[13] && /*geom*/ ctx[13].coordinates) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(50:1) {#each geometries as { id, location_name, geom }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let t0;
    	let map;
    	let t1;
    	let form;
    	let div2;
    	let p;
    	let t3;
    	let div0;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let div1;
    	let input3;
    	let input3_value_value;
    	let input3_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*geometries*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	map = new Map$1({
    			props: { points: /*geometries*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			create_component(map.$$.fragment);
    			t1 = space();
    			form = element("form");
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Add a new point to the map";
    			t3 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			div1 = element("div");
    			input3 = element("input");
    			attr_dev(p, "class", "description");
    			add_location(p, file, 57, 4, 1216);
    			attr_dev(input0, "class", "inputField");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file, 59, 3, 1283);
    			attr_dev(input1, "class", "inputField");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "0.01");
    			attr_dev(input1, "placeholder", "Longitude");
    			add_location(input1, file, 65, 3, 1395);
    			attr_dev(input2, "class", "inputField");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.01");
    			attr_dev(input2, "placeholder", "Latitude");
    			add_location(input2, file, 72, 3, 1530);
    			add_location(div0, file, 58, 4, 1274);
    			attr_dev(input3, "type", "submit");
    			attr_dev(input3, "class", "button block");

    			input3.value = input3_value_value = /*loading*/ ctx[4]
    			? "Loading"
    			: /*areValuesValid*/ ctx[5]
    				? "Upload point"
    				: "Enter valid values";

    			input3.disabled = input3_disabled_value = /*loading*/ ctx[4] || !/*areValuesValid*/ ctx[5];
    			add_location(input3, file, 82, 3, 1686);
    			add_location(div1, file, 81, 4, 1677);
    			attr_dev(div2, "class", "col-6 form-widget");
    			add_location(div2, file, 56, 2, 1180);
    			attr_dev(form, "class", "row flex flex-center");
    			add_location(form, file, 55, 1, 1102);
    			attr_dev(div3, "class", "container");
    			set_style(div3, "padding", "50px 0 100px 0");
    			add_location(div3, file, 47, 0, 877);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div3, t0);
    			mount_component(map, div3, null);
    			append_dev(div3, t1);
    			append_dev(div3, form);
    			append_dev(form, div2);
    			append_dev(div2, p);
    			append_dev(div2, t3);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*newPointName*/ ctx[0]);
    			append_dev(div0, t4);
    			append_dev(div0, input1);
    			set_input_value(input1, /*newPointLon*/ ctx[1]);
    			append_dev(div0, t5);
    			append_dev(div0, input2);
    			set_input_value(input2, /*newPointLat*/ ctx[2]);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, input3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[7]), false, true, false),
    					action_destroyer(/*getData*/ ctx[6].call(null, div3))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*geometries*/ 8) {
    				each_value = /*geometries*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const map_changes = {};
    			if (dirty & /*geometries*/ 8) map_changes.points = /*geometries*/ ctx[3];
    			map.$set(map_changes);

    			if (dirty & /*newPointName*/ 1) {
    				set_input_value(input0, /*newPointName*/ ctx[0]);
    			}

    			if (dirty & /*newPointLon*/ 2 && to_number(input1.value) !== /*newPointLon*/ ctx[1]) {
    				set_input_value(input1, /*newPointLon*/ ctx[1]);
    			}

    			if (dirty & /*newPointLat*/ 4 && to_number(input2.value) !== /*newPointLat*/ ctx[2]) {
    				set_input_value(input2, /*newPointLat*/ ctx[2]);
    			}

    			if (!current || dirty & /*loading, areValuesValid*/ 48 && input3_value_value !== (input3_value_value = /*loading*/ ctx[4]
    			? "Loading"
    			: /*areValuesValid*/ ctx[5]
    				? "Upload point"
    				: "Enter valid values")) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (!current || dirty & /*loading, areValuesValid*/ 48 && input3_disabled_value !== (input3_disabled_value = /*loading*/ ctx[4] || !/*areValuesValid*/ ctx[5])) {
    				prop_dev(input3, "disabled", input3_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(map);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let areValuesValid;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let geometries = [];
    	let newPointName;
    	let newPointLon;
    	let newPointLat;
    	let loading = false;

    	async function getData() {
    		const { data, error } = await supabase.from("geometries").select();

    		if (data) {
    			$$invalidate(3, geometries = data);
    		}
    	}

    	const handleSubmit = async () => {
    		if (areValuesValid) {
    			try {
    				$$invalidate(4, loading = true);

    				const { data: dataInsert, error } = await supabase.rpc("addgeomerty", {
    					location_name: newPointName,
    					lon: newPointLon,
    					lat: newPointLat
    				});

    				$$invalidate(3, geometries = [...geometries, ...dataInsert]);
    				if (error) throw error;
    			} catch(error) {
    				console.log(error, error.error_description || error.message);
    			} finally {
    				$$invalidate(4, loading = false);
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		newPointName = this.value;
    		$$invalidate(0, newPointName);
    	}

    	function input1_input_handler() {
    		newPointLon = to_number(this.value);
    		$$invalidate(1, newPointLon);
    	}

    	function input2_input_handler() {
    		newPointLat = to_number(this.value);
    		$$invalidate(2, newPointLat);
    	}

    	$$self.$capture_state = () => ({
    		Map: Map$1,
    		supabase,
    		geometries,
    		newPointName,
    		newPointLon,
    		newPointLat,
    		loading,
    		getData,
    		handleSubmit,
    		areValuesValid
    	});

    	$$self.$inject_state = $$props => {
    		if ("geometries" in $$props) $$invalidate(3, geometries = $$props.geometries);
    		if ("newPointName" in $$props) $$invalidate(0, newPointName = $$props.newPointName);
    		if ("newPointLon" in $$props) $$invalidate(1, newPointLon = $$props.newPointLon);
    		if ("newPointLat" in $$props) $$invalidate(2, newPointLat = $$props.newPointLat);
    		if ("loading" in $$props) $$invalidate(4, loading = $$props.loading);
    		if ("areValuesValid" in $$props) $$invalidate(5, areValuesValid = $$props.areValuesValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*newPointName, newPointLat, newPointLon*/ 7) {
    			$$invalidate(5, areValuesValid = !!newPointName && !isNaN(newPointLat) && !isNaN(newPointLon));
    		}
    	};

    	return [
    		newPointName,
    		newPointLon,
    		newPointLat,
    		geometries,
    		loading,
    		areValuesValid,
    		getData,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
